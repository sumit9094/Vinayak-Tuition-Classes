import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryImage extends Document {
  imageUrl: string;
  publicId?: string;
  category: 'classroom' | 'events' | 'achievements' | 'facility';
  caption?: string;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GalleryImageSchema: Schema = new Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['classroom', 'events', 'achievements', 'facility'],
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.GalleryImage || mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
