import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_compilation';

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Find student by email
    const student = await Student.findOne({ email: emailLower });
    if (!student) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Sign JWT with student info
    const token = jwt.sign(
      { 
        studentId: student._id.toString(), 
        type: 'student', 
        branch: student.branch 
      },
      JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      message: 'Login successful',
      student: {
        _id: student._id.toString(),
        name: student.name,
        email: student.email,
        phone: student.phone,
        branch: student.branch,
        standard: student.standard,
        subjects: student.subjects,
      },
    });
  } catch (error: any) {
    console.error('Student Login API Error:', error);
    return NextResponse.json(
      { error: 'Login failed due to a server error' },
      { status: 500 }
    );
  }
}
