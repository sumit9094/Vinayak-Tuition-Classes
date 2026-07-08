import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// GET: Fetch reviews
// - Public: Returns only approved reviews
// - Admin/Protected (when query parameter status=all or approved=false is passed): Returns matching reviews
export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status'); // e.g. "all", "pending"
    
    // Check if requester wants all/pending reviews (requires Admin authentication)
    if (statusParam === 'all' || statusParam === 'pending') {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }
      
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET!);
        if (decoded.role !== 'Admin') {
          return NextResponse.json(
            { error: 'Access denied: Admins only' },
            { status: 403 }
          );
        }
      } catch (err) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      
      // Admin authenticated: return reviews based on statusParam
      const filter = statusParam === 'pending' ? { approved: false } : {};
      const reviews = await Review.find(filter).sort({ createdAt: -1 });
      return NextResponse.json({ reviews });
    }
    
    // Default public: return only approved reviews, sorted by most recent
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Reviews GET API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST: Submit a new review (Public - sets approved to false by default)
export async function POST(req: Request) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { name, message, rating } = body;
    
    if (!name || !message || rating === undefined) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }
    
    const newReview = await Review.create({
      name,
      message,
      rating: ratingNum,
      approved: false, // Default is false, requires admin approval
    });
    
    return NextResponse.json(
      {
        message: 'Review submitted successfully. It will be visible after approval.',
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Reviews POST API Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
