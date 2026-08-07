import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

// GET: Fetch all pending reviews (Protected - Admin only)
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const reviews = await Review.find({ approved: false }).sort({ createdAt: -1 });
    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('GET /api/reviews/pending Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending reviews' },
      { status: 500 }
    );
  }
}
