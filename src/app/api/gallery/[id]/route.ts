import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import GalleryImage from '@/models/GalleryImage';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// DELETE: Delete a gallery image by ID (PROTECTED - Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    await connectDB();

    const image = await GalleryImage.findById(id);
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete remote asset from Cloudinary if publicId exists
    if (image.publicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cloudErr) {
        console.error('Cloudinary asset destruction error:', cloudErr);
      }
    }

    // Delete database record
    await GalleryImage.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Gallery image deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/gallery/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 });
  }
}
