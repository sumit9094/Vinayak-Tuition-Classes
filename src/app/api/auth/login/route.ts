import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`login:${ip}`, 10, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    if (!JWT_SECRET) {
      console.error('[auth/login] JWT_SECRET is not configured.');
      return NextResponse.json(
        { error: 'Server misconfiguration. Please contact support.' },
        { status: 500 }
      );
    }

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

    // Find user by email
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token with staff payload
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        branches: user.branches,
        standards: user.standards,
        subject: user.subject,
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
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        branches: user.branches,
        standards: user.standards,
        subject: user.subject,
      },
    });
  } catch (error: any) {
    console.error('Staff Login API Error:', error);
    return NextResponse.json(
      { error: 'Login failed due to a server error' },
      { status: 500 }
    );
  }
}
