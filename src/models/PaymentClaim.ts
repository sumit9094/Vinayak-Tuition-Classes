import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentClaim extends Document {
  studentId: mongoose.Types.ObjectId;
  monthYear: string;
  amount: number;
  transactionId: string;
  status: 'pending' | 'confirmed' | 'rejected';
  claimedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentClaimSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    monthYear: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending',
    },
    claimedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PaymentClaimSchema.index({ studentId: 1, monthYear: 1, status: 1 });

export default mongoose.models.PaymentClaim || mongoose.model<IPaymentClaim>('PaymentClaim', PaymentClaimSchema);
