import mongoose, { Schema } from 'mongoose';

const FeePaymentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    mode: {
      type: String,
      enum: ['cash', 'upi'],
      required: [true, 'Payment mode is required'],
    },
    note: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorded by user ID is required'],
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.FeePayment || mongoose.model('FeePayment', FeePaymentSchema);
