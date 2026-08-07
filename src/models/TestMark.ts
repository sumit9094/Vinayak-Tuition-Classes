import mongoose, { Schema } from 'mongoose';

const TestMarkSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
    },
    testName: {
      type: String,
      required: [true, 'Test Name is required'],
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: 1,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Marked by User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TestMark || mongoose.model('TestMark', TestMarkSchema);
