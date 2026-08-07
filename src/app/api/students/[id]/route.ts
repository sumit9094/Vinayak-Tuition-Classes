import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';

// DELETE: Delete a student (Protected - Admin only)
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

    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Student account deleted successfully',
      student: deletedStudent,
    });
  } catch (error: any) {
    console.error('DELETE Student Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete student account' },
      { status: 500 }
    );
  }
}
