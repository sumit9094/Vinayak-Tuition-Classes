import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import PaymentClaim from '@/models/PaymentClaim';
import FeePayment from '@/models/FeePayment';
import Student from '@/models/Student';
import User from '@/models/User';
import { sendPushToUser } from '@/lib/sendPushNotification';
import { ensureReceiptNumber } from '@/lib/receiptNumber';

// Prevent Webpack tree-shaking of Mongoose models required for .populate()
const _registeredModels = [Student, FeePayment, PaymentClaim, User];
void _registeredModels;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { action, adminId } = body;

    if (!id || !['confirm', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid parameters. Action must be "confirm" or "reject".' },
        { status: 400 }
      );
    }

    const claim = await PaymentClaim.findById(id).populate('studentId', 'name');
    if (!claim) {
      return NextResponse.json({ error: 'Payment claim not found' }, { status: 404 });
    }

    if (claim.status !== 'pending') {
      return NextResponse.json(
        { error: `This claim is already ${claim.status}.` },
        { status: 400 }
      );
    }

    const studentObjId = (claim.studentId as any)?._id || claim.studentId;
    const studentName = (claim.studentId as any)?.name || 'Student';

    // Find valid recordedBy user ID for FeePayment record
    let validAdminId = adminId && mongoose.Types.ObjectId.isValid(adminId) ? adminId : null;
    if (!validAdminId) {
      const adminUser = await User.findOne({ role: 'admin' });
      validAdminId = adminUser?._id || studentObjId;
    }

    if (action === 'confirm') {
      // 1. Check if FeePayment already recorded for this month
      const existingPayment = await FeePayment.findOne({
        studentId: studentObjId,
        monthYear: claim.monthYear,
      });

      if (!existingPayment) {
        // Create actual FeePayment record
        const createdP = await FeePayment.create({
          studentId: studentObjId,
          monthYear: claim.monthYear,
          amount: claim.amount,
          mode: 'upi',
          note: `UPI UTR: ${claim.transactionId}`,
          recordedBy: validAdminId,
          paidAt: new Date(),
        });
        await ensureReceiptNumber(createdP);
      }

      // Update claim status
      claim.status = 'confirmed';
      claim.resolvedAt = new Date();
      if (validAdminId) claim.resolvedBy = validAdminId;
      await claim.save();

      // Send Push notification to student
      sendPushToUser(studentObjId.toString(), 'student', {
        title: 'Payment Confirmed! ✅',
        body: `Your payment of ₹${claim.amount.toLocaleString()} for ${claim.monthYear} (UTR: ${claim.transactionId}) has been verified & confirmed by Admin.`,
        url: '/student/dashboard?tab=fees',
      }).catch((e) => console.error('[Claim Confirm Push Error]:', e));

      return NextResponse.json({
        success: true,
        message: `Payment claim for ${studentName} confirmed and marked as Paid.`,
      });
    } else {
      // Reject action
      claim.status = 'rejected';
      claim.resolvedAt = new Date();
      if (validAdminId) claim.resolvedBy = validAdminId;
      await claim.save();

      // Send Push notification to student alerting them of rejection
      sendPushToUser(studentObjId.toString(), 'student', {
        title: 'Payment Verification Alert ⚠️',
        body: `We couldn't verify your payment of ₹${claim.amount.toLocaleString()} for ${claim.monthYear} (UTR: ${claim.transactionId}). Please check your transaction ID and resubmit in your Fees tab.`,
        url: '/student/dashboard?tab=fees',
      }).catch((e) => console.error('[Claim Reject Push Error]:', e));

      return NextResponse.json({
        success: true,
        message: `Payment claim for ${studentName} rejected. Student can now resubmit a corrected claim.`,
      });
    }
  } catch (error: any) {
    console.error('[PUT Payment Claim Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
