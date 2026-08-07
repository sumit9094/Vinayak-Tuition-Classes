import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import GalleryImage from '@/models/GalleryImage';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// GET: Fetch gallery images (PUBLIC)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const query: any = {};
    if (category && category !== 'All' && ['classroom', 'events', 'achievements', 'facility'].includes(category)) {
      query.category = category;
    }

    const images = await GalleryImage.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('GET /api/gallery error:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 });
  }
}

// POST: Upload a new gallery image (PROTECTED - Admin only)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string;
    const caption = (formData.get('caption') as string) || '';

    if (!category || !['classroom', 'events', 'achievements', 'facility'].includes(category)) {
      return NextResponse.json({ error: 'Please select a valid category' }, { status: 400 });
    }

    let imageUrl = '';
    let publicId = '';

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Check if Cloudinary credentials are configured
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        // Upload to Cloudinary using upload_stream
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'vinayak-tuition-gallery',
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        imageUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      } else {
        // Fallback: convert to base64 data URL if Cloudinary credentials are not set yet
        const mimeType = file.type || 'image/jpeg';
        const base64 = buffer.toString('base64');
        imageUrl = `data:${mimeType};base64,${base64}`;
        publicId = `local_${Date.now()}`;
      }
    } else {
      const directUrl = formData.get('imageUrl') as string;
      if (!directUrl) {
        return NextResponse.json({ error: 'Please select an image file to upload' }, { status: 400 });
      }
      imageUrl = directUrl;
    }

    const newImage = await GalleryImage.create({
      imageUrl,
      publicId,
      category,
      caption: caption.trim(),
      uploadedBy: session.userId,
    });

    return NextResponse.json({ message: 'Gallery photo uploaded successfully', image: newImage }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/gallery error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload gallery image' }, { status: 500 });
  }
}
