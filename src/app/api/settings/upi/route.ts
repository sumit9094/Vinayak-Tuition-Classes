import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import AppSettings from '@/models/AppSettings';
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

// GET: Fetch UPI settings
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let settings = await AppSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      // Seed default settings if not exists
      settings = await AppSettings.create({
        key: 'global_settings',
        upiId: 'chiragvinayak92281@okicici',
        upiPayeeName: 'Vinayak Tuition Classes',
      });
    }

    return NextResponse.json({
      upiId: settings.upiId,
      upiPayeeName: settings.upiPayeeName,
    });
  } catch (error: any) {
    console.error('GET /api/settings/upi error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT: Update UPI settings (Protected - Admin only)
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { upiId, upiPayeeName } = body;

    if (!upiId || !upiPayeeName) {
      return NextResponse.json(
        { error: 'UPI ID and Payee Name are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const settings = await AppSettings.findOneAndUpdate(
      { key: 'global_settings' },
      { upiId, upiPayeeName },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      upiId: settings.upiId,
      upiPayeeName: settings.upiPayeeName,
    });
  } catch (error: any) {
    console.error('PUT /api/settings/upi error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
