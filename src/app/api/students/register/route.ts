import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';
import { BRANCHES, STANDARDS, SUBJECTS_BY_STANDARD } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { fullName, name, email, phone, password, branch, standard } = body;
    const studentName = fullName || name;

    if (!studentName || !email || !phone || !password || !branch || !standard) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate branch
    if (!BRANCHES.includes(branch)) {
      return NextResponse.json(
        { error: 'Invalid branch selection' },
        { status: 400 }
      );
    }

    // Validate standard
    if (!STANDARDS.includes(standard as any)) {
      return NextResponse.json(
        { error: 'Invalid standard selection' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const emailLower = email.toLowerCase().trim();
    const existingStudent = await Student.findOne({ email: emailLower });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-populate subjects from constants based on standard
    const subjects = SUBJECTS_BY_STANDARD[standard] || [];

    // Create Student document
    const student = new Student({
      name: studentName.trim(),
      email: emailLower,
      phone: phone.trim(),
      password: hashedPassword,
      branch,
      standard,
      subjects,
    });

    await student.save();

    // Return student info without password
    const studentResponse = {
      _id: student._id.toString(),
      name: student.name,
      email: student.email,
      phone: student.phone,
      branch: student.branch,
      standard: student.standard,
      subjects: student.subjects,
      createdAt: student.createdAt,
    };

    return NextResponse.json(studentResponse, { status: 201 });
  } catch (error: any) {
    console.error('Student Register API Error:', error);
    return NextResponse.json(
      { error: 'Registration failed due to a server error' },
      { status: 500 }
    );
  }
}
