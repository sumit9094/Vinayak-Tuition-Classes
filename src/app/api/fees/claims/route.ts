import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PaymentClaim from '@/models/PaymentClaim';
import Student from '@/models/Student';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    const claims = await PaymentClaim.find(filter)
      .populate('studentId', 'name standard branch phone')
      .sort({ claimedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, claims });
  } catch (error: any) {
    console.error('[GET Payment Claims API Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
