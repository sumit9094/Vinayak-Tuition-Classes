import mongoose, { Schema } from 'mongoose';

const AdmissionEnquirySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    parentContact: {
      type: String,
      required: [true, 'Parent contact number is required'],
      trim: true,
    },
    standard: {
      type: String,
      required: [true, 'Standard is required'],
      trim: true,
    },
    medium: {
      type: String,
      required: [true, 'Medium is required'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AdmissionEnquiry || mongoose.model('AdmissionEnquiry', AdmissionEnquirySchema);
