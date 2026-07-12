import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import FeePayment from '@/models/FeePayment';
import { ANNUAL_FEE_BY_STANDARD } from '@/lib/constants';
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

// GET: Fetch student fees status (Protected - Admin only)
export async function GET(req: Request) {
  try {
    const session = await getSession();
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

    // Fetch all payments
    const payments = await FeePayment.find({}).lean();

    // Map each student to their fee record summary
    const feeRecords = students.map((student: any) => {
      const studentPayments = payments.filter(
        (p: any) => p.studentId.toString() === student._id.toString()
      );
      const totalPaid = studentPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const std = student.standard || '';
      const totalDue = ANNUAL_FEE_BY_STANDARD[std] || 0;
      const pending = totalDue - totalPaid;

      return {
        studentId: student._id,
        name: student.name,
        standard: student.standard,
        branch: student.branch,
        totalDue,
        totalPaid,
        pending,
      };
    });

    // Sort with highest pending first
    feeRecords.sort((a, b) => b.pending - a.pending);

    return NextResponse.json({ fees: feeRecords });
  } catch (error: any) {
    console.error('GET /api/fees Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fee statuses' },
      { status: 500 }
    );
  }
}
