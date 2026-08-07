import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { BRANCHES, STANDARDS } from '@/lib/constants';

// GET: list all teachers (admin-only)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    return NextResponse.json({ teachers });
  } catch (error: any) {
    console.error('Fetch Teachers API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

// POST: Admin creates a new Teacher
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { name, email, phone, password, branches, subject, standards } = body;

    if (!name || !email || !phone || !password || !branches || !subject || !standards) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email uniqueness
    const emailLower = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
    }

    // Validate branches array
    if (!Array.isArray(branches) || branches.length === 0 || !branches.every(b => BRANCHES.includes(b))) {
      return NextResponse.json({ error: 'Invalid branch selection' }, { status: 400 });
    }

    // Validate standards array
    if (!Array.isArray(standards) || standards.length === 0 || !standards.every(s => STANDARDS.includes(s))) {
      return NextResponse.json({ error: 'Invalid standard selection' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = new User({
      name: name.trim(),
      email: emailLower,
      phone: phone.trim(),
      password: hashedPassword,
      role: 'teacher',
      branches,
      standards,
      subject,
    });

    await teacher.save();

    const responseTeacher = {
      _id: teacher._id.toString(),
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      role: teacher.role,
      branches: teacher.branches,
      standards: teacher.standards,
      subject: teacher.subject,
      createdAt: teacher.createdAt,
    };

    return NextResponse.json(responseTeacher, { status: 201 });
  } catch (error: any) {
    console.error('Create Teacher API Error:', error);
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}
