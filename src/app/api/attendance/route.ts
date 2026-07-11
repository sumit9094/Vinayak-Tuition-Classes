import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
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

// POST: Mark attendance for a student
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    // Check if bulk record structure
    if (body.records && Array.isArray(body.records)) {
      const { branch, subject, date, records } = body;
      if (!branch || !subject || !date || !records || records.length === 0) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      // 1. Verify branches array permission
      const staffBranches = session.branches || [];
      if (!staffBranches.includes(branch)) {
        return NextResponse.json({ error: 'Unauthorized branch selection' }, { status: 403 });
      }

      // 2. Verify subject permission
      if (session.role === 'teacher' && session.subject !== subject) {
        return NextResponse.json({ error: 'Unauthorized subject selection' }, { status: 403 });
      }

      // 3. Fetch allowed student IDs for standard check
      const teacherStandards = session.role === 'teacher' ? (session.standards || []) : null;
      const studentQuery: any = { branch };
      if (teacherStandards) {
        studentQuery.standard = { $in: teacherStandards };
      }
      
      const allowedStudents = await Student.find(studentQuery).select('_id');
      const allowedStudentIds = new Set(allowedStudents.map(s => s._id.toString()));

      // 4. Validate that all submitted students are allowed
      for (const rec of records) {
        if (!allowedStudentIds.has(rec.studentId)) {
          return NextResponse.json(
            { error: `Student with ID ${rec.studentId} is not in your authorized branch/standards.` },
            { status: 400 }
          );
        }
      }

      // 5. Build bulk write operations
      const operations = records.map((rec: any) => ({
        updateOne: {
          filter: {
            studentId: rec.studentId,
            subject,
            branch,
            date: new Date(date),
          },
          update: {
            $set: {
              status: rec.status,
              markedBy: session.userId,
            }
          },
          upsert: true
        }
      }));

      await Attendance.bulkWrite(operations);
      return NextResponse.json({ message: `Attendance saved for ${records.length} students` });
    }

    // Fallback: Single student marking
    const { studentId, subject, branch, date, status } = body;

    if (!studentId || !subject || !branch || !date || !status) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 1. Verify branches array permission
    const staffBranches = session.branches || [];
    if (!staffBranches.includes(branch)) {
      return NextResponse.json({ error: 'Unauthorized branch selection' }, { status: 403 });
    }

    // 2. Verify subject permission
    if (session.role === 'teacher' && session.subject !== subject) {
      return NextResponse.json({ error: 'Unauthorized subject selection' }, { status: 403 });
    }

    // Verify student exists and belongs to this branch
    const student = await Student.findById(studentId);
    if (!student || student.branch !== branch) {
      return NextResponse.json({ error: 'Student not found in this branch' }, { status: 400 });
    }

    // Verify standard permission for teacher
    if (session.role === 'teacher') {
      const teacherStandards = session.standards || [];
      if (!teacherStandards.includes(student.standard)) {
        return NextResponse.json({ error: 'Unauthorized student standard' }, { status: 403 });
      }
    }

    // Save/Update attendance record (prevent duplicates)
    const attendance = await Attendance.findOneAndUpdate(
      { studentId, subject, branch, date: new Date(date) },
      {
        $set: {
          status,
          markedBy: session.userId,
        }
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(attendance, { status: 201 });
  } catch (error: any) {
    console.error('Mark Attendance API Error:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}

// GET: Fetch attendance records filtered by branch + subject + date range
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const subject = searchParams.get('subject');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!branch || !subject) {
      return NextResponse.json({ error: 'Branch and subject parameters are required' }, { status: 400 });
    }

    await connectDB();

    // 1. If student session, verify they are requesting their own attendance and match standard/branch
    if (session.type === 'student') {
      const student = await Student.findById(session.studentId);
      if (!student || student.branch !== branch) {
        return NextResponse.json({ error: 'Unauthorized access to branch' }, { status: 403 });
      }

      // Query own attendance
      const query: any = {
        studentId: session.studentId,
        branch,
        subject,
      };

      if (startDateParam && endDateParam) {
        query.date = {
          $gte: new Date(startDateParam),
          $lte: new Date(endDateParam),
        };
      }

      const records = await Attendance.find(query).sort({ date: -1 });
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

      // Query allowed students based on branch and standard permissions
      let allowedStudentQuery: any = { branch };
      if (session.role === 'teacher') {
        const teacherStandards = session.standards || [];
        allowedStudentQuery.standard = { $in: teacherStandards };
      }
      const allowedStudents = await Student.find(allowedStudentQuery).select('_id');
      const allowedStudentIds = allowedStudents.map(s => s._id);

      const query: any = {
        branch,
        subject,
        studentId: { $in: allowedStudentIds },
      };

      const dateParam = searchParams.get('date');
      if (dateParam) {
        const dateObj = new Date(dateParam);
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
        query.date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      } else if (startDateParam && endDateParam) {
        query.date = {
          $gte: new Date(startDateParam),
          $lte: new Date(endDateParam),
        };
      }

      // Populate student info for dashboard list
      const records = await Attendance.find(query)
        .populate('studentId', 'name standard')
        .sort({ date: -1 });

      return NextResponse.json({ records });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  } catch (error: any) {
    console.error('Fetch Attendance API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
  }
}
