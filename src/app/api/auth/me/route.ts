import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET!);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Check if student session
    if (decoded.studentId && decoded.type === 'student') {
      const student = await Student.findById(decoded.studentId).select('-password');
      if (!student) {
        return NextResponse.json(
          { error: 'Student session not found' },
          { status: 401 }
        );
      }
      return NextResponse.json({
        type: 'student',
        user: {
          _id: student._id.toString(),
          name: student.name,
          email: student.email,
          phone: student.phone,
          branch: student.branch,
          standard: student.standard,
          subjects: student.subjects,
        },
      });
    }
    
    // Otherwise it is a staff session
    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return NextResponse.json(
          { error: 'Staff session not found' },
          { status: 401 }
        );
      }
      return NextResponse.json({
        type: 'staff',
        role: user.role,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          branches: user.branches,
          standards: user.standards,
          subject: user.subject,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid session structure' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Session Verification API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
