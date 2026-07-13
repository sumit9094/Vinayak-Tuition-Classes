import mongoose, { Schema } from 'mongoose';

const FeePaymentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    monthYear: {
      type: String,
      required: [true, 'Month and Year (YYYY-MM) is required'],
      validate: {
        validator: function (v: string) {
          return /^\d{4}-\d{2}$/.test(v);
        },
        message: 'Month and Year must be in YYYY-MM format',
      },
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

// Add unique index so the same month cannot be recorded twice for the same student
FeePaymentSchema.index({ studentId: 1, monthYear: 1 }, { unique: true });

export default mongoose.models.FeePayment || mongoose.model('FeePayment', FeePaymentSchema);
