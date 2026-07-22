import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import FeePayment from '@/models/FeePayment';
import User from '@/models/User';
import { sendPushToUser } from '@/lib/sendPushNotification';
import { MONTHLY_FEE_BY_STANDARD } from '@/lib/constants';
import { getMonthsOwed } from '@/lib/feeUtils';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET!) as any;
  } catch (e) {
    return null;
  }
}

async function getUpdatedBreakdown(studentId: string) {
  const student = await Student.findById(studentId).lean();
  if (!student) return null;

  const joinDate = student.createdAt || new Date();
  const monthsOwed = getMonthsOwed(joinDate);
  const payments = await FeePayment.find({ studentId }).lean();
  const standardRate = MONTHLY_FEE_BY_STANDARD[student.standard] || 0;

  const breakdown = monthsOwed.map((m) => {
    const payment = payments.find((p: any) => p.monthYear === m);
    if (payment) {
      return {
        monthYear: m,
        paid: true,
        amount: payment.amount,
        mode: payment.mode,
        paidAt: payment.paidAt,
        note: payment.note || '',
      };
    } else {
      return {
        monthYear: m,
        paid: false,
        amount: standardRate,
        mode: 'cash',
        paidAt: null,
        note: '',
      };
    }
  });

  breakdown.sort((a, b) => b.monthYear.localeCompare(a.monthYear));
  return breakdown;
}

// POST: Add monthly payment (Protected - Admin only)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { monthYear, amount, mode, note, paidAt } = body;

    // Validation
    if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
      return NextResponse.json(
        { error: 'Valid calendar monthYear (YYYY-MM) is required' },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (mode !== 'cash' && mode !== 'upi') {
      return NextResponse.json(
        { error: 'Mode must be either cash or upi' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check duplicate
    const existing = await FeePayment.findOne({ studentId, monthYear });
    if (existing) {
      return NextResponse.json(
        { error: 'This month is already marked as paid' },
        { status: 400 }
      );
    }

    // Create payment
    await FeePayment.create({
      studentId,
      monthYear,
      amount: parsedAmount,
      mode,
      note: note || '',
      recordedBy: session.userId,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    });

    // 1. Notify Student about payment confirmation
    try {
      await sendPushToUser(String(studentId), 'student', {
        title: '💰 Fee Payment Received',
        body: `Your fee payment of ₹${parsedAmount.toLocaleString('en-IN')} for ${monthYear} was recorded successfully.`,
        url: '/student/dashboard'
      });
    } catch (pushErr) {
      console.error('Student fee push notification error:', pushErr);
    }

    // 2. Notify all Admins about fee received
    try {
      const studentObj = await Student.findById(studentId).select('name');
      const studentName = studentObj ? studentObj.name : 'A student';
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminPushPromises = admins.map(admin =>
        sendPushToUser(String(admin._id), 'staff', {
          title: '💰 Fee Received',
          body: `${studentName} paid ₹${parsedAmount.toLocaleString('en-IN')} for ${monthYear}.`,
          url: '/admin/dashboard'
        }).catch(err => console.error('Admin fee push error:', err))
      );
      await Promise.all(adminPushPromises);
    } catch (adminPushErr) {
      console.error('Admin fee push notification error:', adminPushErr);
    }

    const breakdown = await getUpdatedBreakdown(studentId);
    return NextResponse.json({ success: true, breakdown });
  } catch (error: any) {
    console.error('POST /api/fees/[studentId]/payments Error:', error);
    return NextResponse.json(
      { error: 'Failed to record fee payment' },
      { status: 500 }
    );
  }
}

// DELETE: Remove monthly payment (Protected - Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    let monthYear = searchParams.get('monthYear');

    if (!monthYear) {
      // Try body in case query param was not set
      const body = await req.json().catch(() => ({}));
      monthYear = body.monthYear;
    }

    if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
      return NextResponse.json(
        { error: 'Valid calendar monthYear (YYYY-MM) is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await FeePayment.findOneAndDelete({ studentId, monthYear });
    if (!deleted) {
      return NextResponse.json(
        { error: 'Fee payment record not found for this month' },
        { status: 404 }
      );
    }

    const breakdown = await getUpdatedBreakdown(studentId);
    return NextResponse.json({ success: true, breakdown });
  } catch (error: any) {
    console.error('DELETE /api/fees/[studentId]/payments Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete fee payment' },
      { status: 500 }
    );
  }
}
