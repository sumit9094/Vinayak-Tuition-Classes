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

// GET: Fetch student fees summary (Protected - Admin only)
export async function GET(req: Request) {
  try {
    const session = await getSession();
    // Teacher or Student accounts cannot access this general route
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const branchParam = searchParams.get('branch');

    const filter: any = {};
    if (branchParam) {
      filter.branch = branchParam;
    }

    // Fetch students
    const students = await Student.find(filter).lean();

    // Fetch all fee payment records
    const allPayments = await FeePayment.find({}).lean();

    // Map each student to their computed monthly fee status
    const feeRecords = students.map((student: any) => {
      const studentIdStr = student._id.toString();
      
      // Filter payments belonging to this student
      const studentPayments = allPayments.filter(
        (p: any) => p.studentId.toString() === studentIdStr
      );
      const paidMonths = studentPayments.map((p: any) => p.monthYear);

      // Generate calendar months owed since student creation date
      const joinDate = student.createdAt || new Date();
      const monthsOwed = getMonthsOwed(joinDate);

      // Compute pending calendar months
      const pendingMonths = monthsOwed.filter((m) => !paidMonths.includes(m));

      const standardRate = MONTHLY_FEE_BY_STANDARD[student.standard] || 0;
      const totalPending = pendingMonths.length * standardRate;
      const status = pendingMonths.length === 0 ? 'all_paid' : 'pending';

      return {
        studentId: studentIdStr,
        name: student.name,
        branch: student.branch,
        standard: student.standard,
        monthlyFee: standardRate,
        pendingMonths,
        totalPending,
        status,
      };
    });

    // Sort: "pending" status first, then by totalPending descending (most overdue first)
    feeRecords.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'pending' ? -1 : 1;
      }
      return b.totalPending - a.totalPending;
    });

    return NextResponse.json({ fees: feeRecords });
  } catch (error: any) {
    console.error('GET /api/fees Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fee statuses' },
      { status: 500 }
    );
  }
}
