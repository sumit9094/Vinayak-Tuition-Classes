import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { token, userType, newPassword } = body;

    if (!token || !userType || !newPassword) {
      return NextResponse.json(
        { error: 'Token, user type, and new password are required' },
        { status: 400 }
      );
    }

    if (userType !== 'student' && userType !== 'staff') {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // 1. Look up the token
    const resetTokenRecord = await PasswordResetToken.findOne({ token, userType });

    if (!resetTokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset link. Please request a new link.' },
        { status: 400 }
      );
    }

    // 2. Check if expired
    if (resetTokenRecord.expiresAt < new Date()) {
      // Clean up expired token
      await PasswordResetToken.deleteOne({ _id: resetTokenRecord._id });
      return NextResponse.json(
        { error: 'Your password reset link has expired. Please request a new link.' },
        { status: 400 }
      );
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the password in the appropriate collection based on the stored email
    if (userType === 'student') {
      const student = await Student.findOneAndUpdate(
        { email: resetTokenRecord.email },
        { password: hashedPassword }
      );
      if (!student) {
        return NextResponse.json(
          { error: 'Student account not found' },
          { status: 400 }
        );
      }
    } else {
      const user = await User.findOneAndUpdate(
        { email: resetTokenRecord.email },
        { password: hashedPassword }
      );
      if (!user) {
        return NextResponse.json(
          { error: 'Staff account not found' },
          { status: 400 }
        );
      }
    }

    // 5. Delete the token so it cannot be reused
    await PasswordResetToken.deleteOne({ _id: resetTokenRecord._id });

    return NextResponse.json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}
