import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    await connectDB();

    await PushSubscription.deleteOne({ endpoint });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
