import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
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

// DELETE: Delete a teacher (Protected - Admin only)
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

    // Only allow deletion of users with role 'teacher'
    const deletedTeacher = await User.findOneAndDelete({ _id: id, role: 'teacher' });
    if (!deletedTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Teacher account deleted successfully',
      teacher: deletedTeacher,
    });
  } catch (error: any) {
    console.error('DELETE Teacher Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete teacher account' },
      { status: 500 }
    );
  }
}
