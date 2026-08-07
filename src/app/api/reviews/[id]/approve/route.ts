import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify JWT and check role
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET!);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied: Only Admins can approve reviews' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    // Find the review and update approved to true
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );
    
    if (!updatedReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Review approved successfully',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Approve Review PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to approve review' },
      { status: 500 }
    );
  }
}
