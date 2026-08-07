import mongoose, { Schema } from 'mongoose';
import { BRANCHES, STANDARDS } from '../lib/constants';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['admin', 'teacher'],
      required: [true, 'Role is required'],
    },
    branches: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          return v.every(b => BRANCHES.includes(b as any));
        },
        message: 'Invalid branch selection',
      },
      default: [],
    },
    standards: {
      type: [String],
      validate: {
        validator: function (this: any, v: string[]) {
          if (this.role === 'admin') return true;
          return Array.isArray(v) && v.length > 0 && v.every(s => STANDARDS.includes(s as any));
        },
        message: 'At least one valid standard selection is required for teachers',
      },
      default: [],
    },
    subject: {
      type: String,
      required: function (this: any) {
        return this.role === 'teacher';
      },
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
