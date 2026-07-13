import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import FeePayment from '@/models/FeePayment';
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.role === 'admin';
    const isOwnStudent = session.type === 'student' && session.studentId === studentId;

    if (!isAdmin && !isOwnStudent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const student = await Student.findById(studentId).lean();
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Generate list of months owed from join date to now
    const joinDate = student.createdAt || new Date();
    const monthsOwed = getMonthsOwed(joinDate);

    // Fetch existing payments
    const payments = await FeePayment.find({ studentId }).lean();

    const standardRate = MONTHLY_FEE_BY_STANDARD[student.standard] || 0;

    // Create monthly breakdown list
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
          amount: standardRate, // Suggest default standard rate for unpaid months
          mode: 'cash',
          paidAt: null,
          note: '',
        };
      }
    });

    // Sort by calendar month descending (newest first for readability)
    breakdown.sort((a, b) => b.monthYear.localeCompare(a.monthYear));

    return NextResponse.json({
      student: {
        id: student._id.toString(),
        name: student.name,
        branch: student.branch,
        standard: student.standard,
        phone: student.phone || '',
        parentContact: student.parentContact || '',
      },
      breakdown,
    });
  } catch (error: any) {
    console.error('GET /api/fees/[studentId] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student fee breakdown' },
      { status: 500 }
    );
  }
}
