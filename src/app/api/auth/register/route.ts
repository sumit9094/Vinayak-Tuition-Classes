import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
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
      role: role || 'Admin',
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
