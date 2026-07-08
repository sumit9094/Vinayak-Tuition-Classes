import mongoose, { Schema } from 'mongoose';
import { BRANCHES, STANDARDS } from '../lib/constants';

const StudentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    parentContact: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    branch: {
      type: String,
      enum: [...BRANCHES, null, ''],
    },
    standard: {
      type: String,
      enum: [...STANDARDS, null, ''],
      required: [true, 'Standard is required'],
    },
    subjects: {
      type: [String],
      default: [],
    },
    medium: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
