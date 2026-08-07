import mongoose, { Schema } from 'mongoose';

const AppSettingsSchema = new Schema(
  {
    key: {
      type: String,
      default: 'global_settings',
      unique: true,
    },
    upiId: {
      type: String,
      required: true,
      default: 'chiragvinayak92281@okicici',
    },
    upiPayeeName: {
      type: String,
      required: true,
      default: 'Vinayak Tuition Classes',
    },
    previousUpiId: {
      type: String,
      default: '',
    },
    changedAt: {
      type: Date,
    },
    upiOtpCode: {
      type: String,
      default: '',
    },
    upiOtpExpiresAt: {
      type: Date,
    },
    pendingUpiId: {
      type: String,
      default: '',
    },
    pendingUpiPayeeName: {
      type: String,
      default: '',
    },
    otpRequestHistory: [
      {
        type: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AppSettings || mongoose.model('AppSettings', AppSettingsSchema);
