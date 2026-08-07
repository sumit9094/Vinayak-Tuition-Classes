import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import FeePayment from '@/models/FeePayment';
import Student from '@/models/Student';
import User from '@/models/User';
import { ensureReceiptNumber } from '@/lib/receiptNumber';
import { numberToWordsIndian } from '@/lib/numberToWords';
import { generateFeeReceiptPdf } from '@/lib/pdfGenerator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Prevent Webpack tree-shaking of Mongoose models required for .populate()
const _registeredModels = [Student, FeePayment, User];
void _registeredModels;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized — Please login again' }, { status: 401 });
    }

    await connectDB();
    const { paymentId } = await params;

    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json({ error: 'Invalid payment ID format' }, { status: 400 });
    }

    const payment = await FeePayment.findById(paymentId).populate('studentId');
    if (!payment || !payment.studentId) {
      return NextResponse.json({ error: 'Fee payment record not found' }, { status: 404 });
    }

    const student = payment.studentId as any;
    const studentIdStr = student._id ? student._id.toString() : String(student);

    // Security Authorization Check:
    // User must be either the student who owns the payment OR an admin/teacher staff
    const sessionStudentId = session.studentId || session.userId || (session as any)._id;
    const isOwnerStudent = Boolean(sessionStudentId && String(sessionStudentId) === String(studentIdStr));
    const isStaff = session.type === 'staff' || session.role === 'admin' || session.role === 'teacher';

    if (!isOwnerStudent && !isStaff) {
      console.warn('Receipt access denied:', { sessionStudentId, studentIdStr, sessionType: session.type });
      return NextResponse.json({ error: 'Access denied to this fee receipt' }, { status: 403 });
    }

    // Ensure permanent sequential receipt number is assigned (e.g. #0001)
    const receiptNumber = await ensureReceiptNumber(payment);

    // Determine language from student.medium
    const studentMedium = (student.medium || '').toString().trim().toLowerCase();
    const isGujarati = studentMedium === 'gujarati' || studentMedium === 'gj';

    // Format paidAt date as DD/MM/YYYY
    const paidDate = payment.paidAt ? new Date(payment.paidAt) : new Date(payment.createdAt || Date.now());
    const day = paidDate.getDate().toString().padStart(2, '0');
    const month = (paidDate.getMonth() + 1).toString().padStart(2, '0');
    const year = paidDate.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    // Format Fees Month
    const [yStr, mStr] = (payment.monthYear || '').split('-');
    const mNum = parseInt(mStr || '1', 10) - 1;
    const monthsEN = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthsGJ = [
      'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
      'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'
    ];

    const feesMonth = isGujarati
      ? `${monthsGJ[mNum] || mStr} ${yStr}`
      : `${monthsEN[mNum] || mStr} ${yStr}`;

    // Amount in Words
    const amountInWords = numberToWordsIndian(payment.amount || 0, isGujarati ? 'gj' : 'en');

    // Generate PDF Buffer via PDFKit (100% serverless native PDF generator, 0 React reconciler conflicts)
    const pdfBuffer = await generateFeeReceiptPdf({
      receiptNumber,
      dateStr,
      studentName: student.name || 'Student',
      standard: student.standard || '',
      branch: student.branch || '',
      feesMonth,
      paymentMode: payment.mode || 'cash',
      amount: payment.amount || 0,
      amountInWords,
      isGujarati,
    });

    const safeFilename = `receipt-${receiptNumber.replace('#', '')}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('PDF Receipt Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt PDF', details: error.message },
      { status: 500 }
    );
  }
}
