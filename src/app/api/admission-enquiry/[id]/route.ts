import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import AdmissionEnquiry from '@/models/AdmissionEnquiry';
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

// PUT: Mark admission enquiry as reviewed (Protected - Admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { reviewed } = body;

    await connectDB();

    const updatedEnquiry = await AdmissionEnquiry.findByIdAndUpdate(
      id,
      { reviewed: Boolean(reviewed) },
      { new: true }
    );

    if (!updatedEnquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Enquiry status updated successfully',
      enquiry: updatedEnquiry,
    });
  } catch (error: any) {
    console.error('PUT /api/admission-enquiry/[id] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update enquiry status' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an admission enquiry (Protected - Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const deletedEnquiry = await AdmissionEnquiry.findByIdAndDelete(id);
    if (!deletedEnquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Enquiry deleted successfully',
      enquiry: deletedEnquiry,
    });
  } catch (error: any) {
    console.error('DELETE /api/admission-enquiry/[id] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete enquiry' },
      { status: 500 }
    );
  }
}
