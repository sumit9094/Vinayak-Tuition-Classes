import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';
import { STANDARDS } from '@/lib/constants';

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

// GET: Fetch student list (Protected - Admin/Teacher only)
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const branchParam = searchParams.get('branch');
    const standardParam = searchParams.get('standard');
    const subjectParam = searchParams.get('subject');

    let query: any = {};

    if (session.role === 'admin') {
      // Admin sees all students, optionally filtered by branch, standard, and subject query param
      if (branchParam) {
        query.branch = branchParam;
      }
      if (standardParam) {
        query.standard = standardParam;
      }
      if (subjectParam) {
        query.subjects = subjectParam;
      }
    } else if (session.role === 'teacher') {
      // Teacher sees only students whose branch is in teacher's branches AND whose standard is in teacher's standards AND whose subjects array includes the teacher's subject
      const teacherBranches = session.branches || [];
      const teacherStandards = session.standards || [];
      const teacherSubject = session.subject;
      
      let branchQuery: any;
      if (branchParam) {
        if (teacherBranches.includes(branchParam)) {
          branchQuery = branchParam;
        } else {
          return NextResponse.json({ error: 'Unauthorized branch access' }, { status: 403 });
        }
      } else {
        branchQuery = { $in: teacherBranches };
      }

      let standardQuery: any;
      if (standardParam) {
        if (teacherStandards.includes(standardParam)) {
          standardQuery = standardParam;
        } else {
          return NextResponse.json({ error: 'Unauthorized standard access' }, { status: 403 });
        }
      } else {
        standardQuery = { $in: teacherStandards };
      }
      
      query = {
        branch: branchQuery,
        standard: standardQuery,
        subjects: subjectParam || teacherSubject,
      };
    } else {
      // Students or invalid roles cannot list other students
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Students GET API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student data' },
      { status: 500 }
    );
  }
}

// POST: Submit a new admission application (Public - Homepage Form)
export async function POST(req: Request) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { name, parentContact, standard, medium, message } = body;
    
    if (!name || !parentContact || !standard || !medium) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    const newStudent = await Student.create({
      name,
      parentContact,
      standard,
      medium,
      message: message || '',
    });
    
    return NextResponse.json(
      {
        message: 'Admission form submitted successfully',
        student: newStudent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Students POST API Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit admission form' },
      { status: 500 }
    );
  }
}
