import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import TestMark from '@/models/TestMark';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET!) as any;
  } catch (e) {
    return null;
  }
}

// POST: Add test mark for a student
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { studentId, subject, branch, testName, marksObtained, totalMarks } = body;

    if (!studentId || !subject || !branch || !testName || marksObtained === undefined || !totalMarks) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 1. Verify branches array permission
    const staffBranches = session.branches || [];
    if (!staffBranches.includes(branch)) {
      return NextResponse.json({ error: 'Unauthorized branch selection' }, { status: 403 });
    }

    // 2. Verify subject permission (Teachers can only mark their assigned subject)
    if (session.role === 'teacher' && session.subject !== subject) {
      return NextResponse.json({ error: 'Unauthorized subject selection' }, { status: 403 });
    }

    // Verify student exists and belongs to this branch
    const student = await Student.findById(studentId);
    if (!student || student.branch !== branch) {
      return NextResponse.json({ error: 'Student not found in this branch' }, { status: 400 });
    }

    // Save test mark record
    const testMark = new TestMark({
      studentId,
      subject,
      branch,
      testName: testName.trim(),
      marksObtained: Number(marksObtained),
      totalMarks: Number(totalMarks),
      markedBy: session.userId,
    });

    await testMark.save();
    return NextResponse.json(testMark, { status: 201 });
  } catch (error: any) {
    console.error('Record Test Marks API Error:', error);
    return NextResponse.json({ error: 'Failed to record test marks' }, { status: 500 });
  }
}

// GET: Fetch test marks filtered by branch + subject
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const subject = searchParams.get('subject');
    const testName = searchParams.get('testName');

    if (!branch || !subject) {
      return NextResponse.json({ error: 'Branch and subject parameters are required' }, { status: 400 });
    }

    await connectDB();

    // 1. If student session, verify they are requesting their own marks and match standard/branch
    if (session.type === 'student') {
      const student = await Student.findById(session.studentId);
      if (!student || student.branch !== branch) {
        return NextResponse.json({ error: 'Unauthorized access to branch' }, { status: 403 });
      }

      // Query own test marks
      const query: any = {
        studentId: session.studentId,
        branch,
        subject,
      };

      if (testName) {
        query.testName = testName;
      }

      const records = await TestMark.find(query).sort({ createdAt: -1 });
      return NextResponse.json({ records });
    }

    // 2. Otherwise it is staff session (Admin / Teacher)
    if (session.role === 'teacher' || session.role === 'admin') {
      const staffBranches = session.branches || [];
      if (!staffBranches.includes(branch)) {
        return NextResponse.json({ error: 'Unauthorized access to branch' }, { status: 403 });
      }

      if (session.role === 'teacher' && session.subject !== subject) {
        return NextResponse.json({ error: 'Unauthorized access to subject' }, { status: 403 });
      }

      const query: any = {
        branch,
        subject,
      };

      if (testName) {
        query.testName = testName;
      }

      // Populate student info for list
      const records = await TestMark.find(query)
        .populate('studentId', 'name standard')
        .sort({ createdAt: -1 });

      return NextResponse.json({ records });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  } catch (error: any) {
    console.error('Fetch Test Marks API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch test marks data' }, { status: 500 });
  }
}
