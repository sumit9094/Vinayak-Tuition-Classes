import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import crypto from 'crypto';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, userType } = body;

    if (!email || !userType) {
      return NextResponse.json(
        { error: 'Email and user type are required' },
        { status: 400 }
      );
    }

    if (userType !== 'student' && userType !== 'staff') {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // 1. Look up email in correct collection
    let userExists = false;
    if (userType === 'student') {
      const student = await Student.findOne({ email: emailLower });
      if (student) userExists = true;
    } else {
      const user = await User.findOne({ email: emailLower });
      if (user) userExists = true;
    }

    const successMessage = 'If this email exists, a password reset link has been sent.';

    // 2. Security practice: If email doesn't exist, return success to prevent email enumeration
    if (!userExists) {
      return NextResponse.json({ message: successMessage });
    }

    // 3. Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // 4. Save token to DB (Delete any existing tokens for this email/userType first to prevent clutter)
    await PasswordResetToken.deleteMany({ email: emailLower, userType });
    await PasswordResetToken.create({
      email: emailLower,
      userType,
      token,
      expiresAt,
    });

    // 5. Generate Reset Link
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}&type=${userType}`;

    // 6. Send email via Resend (or log to console if no API Key is set)
    const apiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

    if (!apiKey || apiKey.includes('key_here') || apiKey === '') {
      console.log('\n==================================================');
      console.log(`[PASSWORD RESET DEV MODE] Link for: ${emailLower} (${userType})`);
      console.log(`Reset Link: ${resetLink}`);
      console.log('==================================================\n');
    } else {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: emailFrom,
        to: emailLower,
        subject: 'Reset Your Password - Vinayak Tuition Classes',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #8B5CF6;">Vinayak Tuition Classes</h2>
            <p>Hello,</p>
            <p>You requested to reset your password. Please click the button below to set a new password:</p>
            <div style="margin: 24px 0;">
              <a href="${resetLink}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 12px; color: #718096;">This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #a0aec0;">If the button above does not work, copy and paste this URL into your browser: <br/> ${resetLink}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ message: successMessage });
  } catch (error: any) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
