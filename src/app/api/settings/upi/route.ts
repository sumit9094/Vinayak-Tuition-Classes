import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import AppSettings from '@/models/AppSettings';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

// GET: Fetch UPI settings
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let settings = await AppSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      // Seed default settings if not exists
      settings = await AppSettings.create({
        key: 'global_settings',
        upiId: 'chiragvinayak92281@okicici',
        upiPayeeName: 'Vinayak Tuition Classes',
      });
    }

    // Auto-sanitize existing database record if it contains stray spaces
    const cleanDbUpiId = (settings.upiId || '').replace(/\s+/g, '').trim();
    const cleanDbPayeeName = (settings.upiPayeeName || '').trim();

    if (settings.upiId !== cleanDbUpiId || settings.upiPayeeName !== cleanDbPayeeName) {
      settings.upiId = cleanDbUpiId;
      settings.upiPayeeName = cleanDbPayeeName;
      await settings.save();
    }

    return NextResponse.json({
      upiId: settings.upiId,
      upiPayeeName: settings.upiPayeeName,
    });
  } catch (error: any) {
    console.error('GET /api/settings/upi error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST: Request Email OTP for UPI settings change (Protected - Admin only, max 3 in 15 mins)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { upiId, upiPayeeName } = body;

    if (!upiId || !upiPayeeName) {
      return NextResponse.json(
        { error: 'UPI ID and Payee Name are required' },
        { status: 400 }
      );
    }

    const cleanUpiId = String(upiId).replace(/\s+/g, '').trim();
    const cleanPayeeName = String(upiPayeeName).trim();

    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(cleanUpiId)) {
      return NextResponse.json(
        { error: 'Invalid UPI ID format. Expected format: username@bankhandle (e.g. chiragvinayak92281@okicici)' },
        { status: 400 }
      );
    }

    await connectDB();

    const adminUser = await User.findById(session.userId);
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    let settings = await AppSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = new AppSettings({ key: 'global_settings' });
    }

    // Rate limiting: max 3 requests within 15 minutes
    const now = Date.now();
    const fifteenMinsAgo = now - 15 * 60 * 1000;
    const recentRequests = (settings.otpRequestHistory || []).filter(
      (t: Date) => new Date(t).getTime() > fifteenMinsAgo
    );

    if (recentRequests.length >= 3) {
      return NextResponse.json(
        { error: 'Too many verification code requests. Please wait 15 minutes before requesting a new code.' },
        { status: 429 }
      );
    }

    // Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(now + 10 * 60 * 1000); // 10 minutes expiry

    settings.upiOtpCode = otpCode;
    settings.upiOtpExpiresAt = otpExpiresAt;
    settings.pendingUpiId = cleanUpiId;
    settings.pendingUpiPayeeName = cleanPayeeName;
    settings.otpRequestHistory = [...recentRequests, new Date()];

    await settings.save();

    // Send OTP Email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const adminEmail = adminUser.email || process.env.ADMIN_EMAIL || 'chiragvinayak92281@gmail.com';

    if (apiKey && !apiKey.includes('key_here') && apiKey !== '') {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: emailFrom,
          to: adminEmail,
          subject: 'Verification Code — UPI Settings Change',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <h2 style="color: #8B5CF6; margin-top: 0; font-size: 20px;">Vinayak Tuition Classes</h2>
              <h3 style="color: #0f172a; margin-top: 4px; font-size: 16px;">UPI Settings Change Verification Code</h3>
              <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                You requested to update the receiving UPI Payment ID for tuition fee collection. Use the 6-digit verification code below to confirm this change:
              </p>
              <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; border: 1px solid #cbd5e1;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #8B5CF6; font-family: monospace;">${otpCode}</span>
                <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600;">(Expiring in 10 minutes)</p>
              </div>
              <div style="background-color: #f8fafc; padding: 14px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                <p style="margin: 4px 0; font-size: 12px; color: #475569;"><strong>Pending New UPI ID:</strong> ${cleanUpiId}</p>
                <p style="margin: 4px 0; font-size: 12px; color: #475569;"><strong>Payee Name:</strong> ${cleanPayeeName}</p>
              </div>
              <p style="font-size: 12px; color: #94a3b8;">
                If you did not initiate this request, please ignore this email and ensure your admin account password remains secure.
              </p>
            </div>
          `,
        });
        console.log(`[UPI OTP Request] Code ${otpCode} sent to ${adminEmail}`);
      } catch (emailErr) {
        console.error('[UPI OTP Resend Email Error]:', emailErr);
      }
    } else {
      console.log(`[UPI OTP DEV MODE] Code for ${adminEmail}: ${otpCode} (Pending UPI ID: ${cleanUpiId})`);
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${adminEmail}`,
    });
  } catch (error: any) {
    console.error('POST /api/settings/upi/request-otp error:', error);
    return NextResponse.json(
      { error: 'Failed to request verification code' },
      { status: 500 }
    );
  }
}

// PUT: Verify OTP & Save UPI settings (Protected - Admin only)
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { otpCode } = body;

    if (!otpCode || String(otpCode).trim().length !== 6) {
      return NextResponse.json(
        { error: 'A valid 6-digit verification code is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const adminUser = await User.findById(session.userId);
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    let settings = await AppSettings.findOne({ key: 'global_settings' });
    if (!settings || !settings.upiOtpCode || !settings.pendingUpiId) {
      return NextResponse.json(
        { error: 'No pending UPI change request found. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Check expiration
    const now = Date.now();
    const expiresAt = settings.upiOtpExpiresAt ? new Date(settings.upiOtpExpiresAt).getTime() : 0;
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check OTP match
    if (String(otpCode).trim() !== settings.upiOtpCode) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check your email and try again.' },
        { status: 400 }
      );
    }

    // Apply pending UPI changes
    const previousUpiId = settings.upiId || '';
    const cleanUpiId = settings.pendingUpiId;
    const cleanPayeeName = settings.pendingUpiPayeeName;
    const upiChanged = cleanUpiId !== previousUpiId;

    if (upiChanged) {
      settings.previousUpiId = previousUpiId;
      settings.changedAt = new Date();
    }

    settings.upiId = cleanUpiId;
    settings.upiPayeeName = cleanPayeeName;

    // Clear OTP fields after successful verification
    settings.upiOtpCode = '';
    settings.upiOtpExpiresAt = undefined;
    settings.pendingUpiId = '';
    settings.pendingUpiPayeeName = '';

    await settings.save();

    // Send final Change Confirmation Email Alert via Resend
    if (upiChanged) {
      const apiKey = process.env.RESEND_API_KEY;
      const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      const adminEmail = adminUser.email || process.env.ADMIN_EMAIL || 'chiragvinayak92281@gmail.com';
      const changeTimeStr = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium',
      });

      if (apiKey && !apiKey.includes('key_here') && apiKey !== '') {
        try {
          const resend = new Resend(apiKey);
          await resend.emails.send({
            from: emailFrom,
            to: adminEmail,
            subject: 'UPI Payment ID Changed — Vinayak Tuition Classes',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <h2 style="color: #8B5CF6; margin-top: 0; font-size: 20px;">Vinayak Tuition Classes</h2>
                <h3 style="color: #0f172a; margin-top: 4px; font-size: 16px;">Confirmation: UPI Payment ID Updated</h3>
                <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                  The receiving UPI Payment ID for tuition fee collection was successfully verified via OTP and updated on <strong>${changeTimeStr} (IST)</strong>.
                </p>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #cbd5e1;">
                  <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Previous UPI ID:</strong> ${previousUpiId || 'N/A'}</p>
                  <p style="margin: 4px 0; font-size: 13px; color: #059669;"><strong>New UPI ID:</strong> ${cleanUpiId}</p>
                  <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Payee Name:</strong> ${cleanPayeeName}</p>
                </div>
                <div style="font-size: 12px; color: #dc2626; font-weight: bold; background-color: #fef2f2; padding: 14px; border-radius: 10px; border: 1px solid #fecaca; margin-top: 20px;">
                  ⚠️ Security Notice: If you did not authorize this change, please contact support immediately.
                </div>
              </div>
            `,
          });
          console.log(`[UPI Change Confirmation Alert] Email sent to ${adminEmail}`);
        } catch (emailErr) {
          console.error('[UPI Change Email Alert Error]:', emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      upiId: settings.upiId,
      upiPayeeName: settings.upiPayeeName,
      previousUpiId: settings.previousUpiId,
      changedAt: settings.changedAt,
    });
  } catch (error: any) {
    console.error('PUT /api/settings/upi error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code and save settings' },
      { status: 500 }
    );
  }
}
