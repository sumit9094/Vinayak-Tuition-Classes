import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import PaymentClaim from '@/models/PaymentClaim';
import { sendPushToUser } from '@/lib/sendPushNotification';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { studentId, studentName, amount, standard, branch, transactionId, monthYear } = body;

    if (!studentId || !studentName || !amount || !transactionId || !monthYear) {
      return NextResponse.json(
        { error: 'Missing required fields: Student ID, Transaction ID, Month & Amount are required.' },
        { status: 400 }
      );
    }

    const cleanTxnId = String(transactionId).trim();
    if (cleanTxnId.length < 6) {
      return NextResponse.json(
        { error: 'UPI Transaction ID / UTR Number must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check for existing pending claim for same student + month
    const existingPending = await PaymentClaim.findOne({
      studentId,
      monthYear,
      status: 'pending',
    });

    if (existingPending) {
      return NextResponse.json(
        { error: 'A payment claim for this month has already been submitted and is awaiting admin confirmation.' },
        { status: 400 }
      );
    }

    // Save new PaymentClaim
    const newClaim = await PaymentClaim.create({
      studentId,
      monthYear,
      amount: Number(amount),
      transactionId: cleanTxnId,
      status: 'pending',
      claimedAt: new Date(),
    });

    const formattedAmount = Number(amount).toLocaleString('en-IN');
    const adminUrl = `/admin/dashboard?tab=fees&studentId=${studentId}`;
    const pushTitle = `Payment Claimed: ${studentName}`;
    const pushBody = `${studentName} (Std. ${standard || 'N/A'}, ${branch || 'Tuition'}) claims payment of ₹${formattedAmount} for ${monthYear} — Transaction ID: ${cleanTxnId}. Please verify in your bank app.`;

    // 1. Find all admin staff members
    const adminStaff = await User.find({ type: 'staff', role: 'admin' });

    // 2. Dispatch Web Push Notifications to all admins
    if (adminStaff.length > 0) {
      const pushPromises = adminStaff.map((admin) =>
        sendPushToUser(admin._id.toString(), 'staff', {
          title: pushTitle,
          body: pushBody,
          url: adminUrl,
        }).catch((err) =>
          console.error(`[Notify Payment] Push failed for admin ${admin.email}:`, err)
        )
      );
      await Promise.all(pushPromises);
    }

    // 3. Dispatch Email Notification via Resend to Admin email if configured
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_TO || 'sumit9094@gmail.com';
    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: emailFrom,
          to: adminEmail,
          subject: `Payment Claimed: ${studentName} (₹${formattedAmount}, UTR: ${cleanTxnId})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #8B5CF6; margin-top: 0;">Vinayak Tuition Classes — Fee Payment Claim</h2>
              <p style="font-size: 14px; color: #334155;">
                Student <strong>${studentName}</strong> (Std. ${standard || 'N/A'}, Branch: ${branch || 'Vinayak'}) has submitted a tuition fee payment claim with Transaction ID / UTR.
              </p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #8B5CF6; margin: 20px 0;">
                <p style="margin: 4px 0; font-size: 14px;"><strong>Student Name:</strong> ${studentName}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Month & Amount:</strong> ${monthYear} — ₹${formattedAmount}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>UPI Transaction ID / UTR:</strong> <span style="font-family: monospace; color: #8B5CF6; font-weight: bold;">${cleanTxnId}</span></p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Standard & Branch:</strong> Std. ${standard || 'N/A'} (${branch || 'N/A'})</p>
                <p style="margin: 4px 0; font-size: 14px; color: #64748b;"><em>Note: Please check your bank statement to match this UTR number, then Confirm or Reject in the Fees section.</em></p>
              </div>
              <a href="https://vinayak-tuition.vercel.app/admin/dashboard?tab=fees&studentId=${studentId}" 
                 style="display: inline-block; background-color: #8B5CF6; color: #ffffff; padding: 12px 24px; font-weight: bold; border-radius: 8px; text-decoration: none; font-size: 14px;">
                Review Pending Claims in Admin Dashboard
              </a>
            </div>
          `,
        });
        console.log(`[Notify Payment] Email sent successfully to ${adminEmail}`);
      } catch (emailErr) {
        console.error('[Notify Payment] Resend email dispatch failed:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      claim: newClaim,
      message: 'Your payment claim with Transaction ID has been submitted and is awaiting admin confirmation.',
    });
  } catch (error: any) {
    console.error('[Notify Payment] API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
