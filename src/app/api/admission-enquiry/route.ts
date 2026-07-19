import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import AdmissionEnquiry from '@/models/AdmissionEnquiry';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendPushToUser } from '@/lib/sendPushNotification';

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

// POST: Public submission of a new admission inquiry
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, parentContact, standard, medium, message } = body;

    if (!name || !parentContact || !standard || !medium) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const enquiry = await AdmissionEnquiry.create({
      name: name.trim(),
      parentContact: parentContact.trim(),
      standard,
      medium,
      message: (message || '').trim(),
    });

    // Notify all admin users via push notification
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      admins.forEach((admin) => {
        sendPushToUser(admin._id.toString(), 'staff', {
          title: 'New Admission Enquiry',
          body: `${name.trim()} submitted an admission enquiry.`,
          url: '/admin/dashboard'
        }).catch(err => console.error('Push notification trigger error:', err));
      });
    } catch (pushErr) {
      console.error('Failed to query admins for push notification:', pushErr);
    }

    return NextResponse.json(
      { message: 'Inquiry submitted successfully', enquiry },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/admission-enquiry Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit admission form' },
      { status: 500 }
    );
  }
}

// GET: Fetch list of all inquiries (Protected - Admin only)
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const enquiries = await AdmissionEnquiry.find().sort({ createdAt: -1 });

    return NextResponse.json({ enquiries });
  } catch (error: any) {
    console.error('GET /api/admission-enquiry Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
