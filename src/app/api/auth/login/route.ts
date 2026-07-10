import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
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
        subject: user.subject 
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
      secure: true,
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
