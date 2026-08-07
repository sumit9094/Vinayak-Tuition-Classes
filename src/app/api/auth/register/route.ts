import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    // SECURITY: this endpoint creates staff accounts. It previously had NO auth
    // check and defaulted an unspecified role to 'Admin' — meaning anyone on the
    // internet could POST here and create their own admin account. Require an
    // existing admin session, and never trust a client-supplied role.
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { fullName, name, email, phone, password, role } = body;

    const displayName = fullName || name;

    if (!displayName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Only allow explicitly whitelisted roles — never trust arbitrary client input,
    // and never fall back to 'Admin' by default.
    const allowedRoles = ['teacher', 'admin'];
    const safeRole = allowedRoles.includes(role) ? role : 'teacher';

    // Check if email already exists
    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new User
    const newUser = await User.create({
      name: displayName,
      email: emailLower,
      phone,
      password: hashedPassword,
      role: safeRole,
    });

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'Registration failed due to a server error' },
      { status: 500 }
    );
  }
}
