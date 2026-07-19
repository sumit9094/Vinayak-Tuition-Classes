import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sendPushToUser } from '@/lib/sendPushNotification';
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

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, totalPending } = body;

    if (!studentId || totalPending === undefined) {
      return NextResponse.json({ error: 'studentId and totalPending are required' }, { status: 400 });
    }

    await sendPushToUser(studentId, 'student', {
      title: 'Fee Payment Reminder',
      body: `Your pending fee is ₹${totalPending}. Please pay soon.`,
      url: '/student/dashboard'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Fee remind API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
