import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    let userId: string;
    let userType: 'student' | 'staff';

    if (decoded.studentId && decoded.type === 'student') {
      userId = decoded.studentId;
      userType = 'student';
    } else if (decoded.userId) {
      userId = decoded.userId;
      userType = 'staff';
    } else {
      return NextResponse.json({ error: 'Invalid session structure' }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    await connectDB();

    const existing = await PushSubscription.findOne({ endpoint });

    if (existing) {
      existing.userId = userId;
      existing.userType = userType;
      existing.keys = keys;
      await existing.save();
    } else {
      await PushSubscription.create({
        userId,
        userType,
        endpoint,
        keys,
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
