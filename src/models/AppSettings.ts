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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AppSettings || mongoose.model('AppSettings', AppSettingsSchema);
