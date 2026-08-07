// scripts/cleanup-test-data.ts
// Run with: npx tsx scripts/cleanup-test-data.ts
// Make sure MONGODB_URI is available
// (loads from .env.local automatically if using dotenv)

import fs from 'fs';
import path from 'path';

// Load .env.local variables before any imports
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const matched = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (matched) {
      const key = matched[1];
      let value = (matched[2] || '').trim();
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  }
}

const DRY_RUN = true; // <-- keep this TRUE first to see counts, then change to false to actually delete

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found in environment');

  const mongoose = (await import('mongoose')).default;
  const User = (await import('../src/models/User')).default;
  const Student = (await import('../src/models/Student')).default;
  const Attendance = (await import('../src/models/Attendance')).default;
  const TestMark = (await import('../src/models/TestMark')).default;
  const FeePayment = (await import('../src/models/FeePayment')).default;
  const PaymentClaim = (await import('../src/models/PaymentClaim')).default;
  const PushSubscription = (await import('../src/models/PushSubscription')).default;
  const PasswordResetToken = (await import('../src/models/PasswordResetToken')).default;

  await mongoose.connect(uri);
  console.log('Connected to DB. DRY_RUN =', DRY_RUN);

  // Find all teacher accounts (role: 'teacher') – admin accounts are untouched
  const teacherIds = (await User.find({ role: 'teacher' }, '_id')).map((u: any) => u._id);
  const studentIds = (await Student.find({}, '_id')).map((s: any) => s._id);
  const survivingAdminIds = (await User.find({ role: 'admin' }, '_id')).map((u: any) => u._id);

  console.log(`Teachers to remove: ${teacherIds.length}`);
  console.log(`Students to remove: ${studentIds.length}`);
  console.log(`Admins kept (untouched): ${survivingAdminIds.length}`);

  const attendanceCount = await Attendance.countDocuments({ studentId: { $in: studentIds } });
  const marksCount = await TestMark.countDocuments({ studentId: { $in: studentIds } });
  const feesCount = await FeePayment.countDocuments({ studentId: { $in: studentIds } });
  const claimsCount = await PaymentClaim.countDocuments({ studentId: { $in: studentIds } });
  const pushCount = await PushSubscription.countDocuments({
    $or: [
      { userType: 'student' },
      { userType: 'staff', userId: { $in: teacherIds } },
    ],
  });
  const tokenCount = await PasswordResetToken.countDocuments({});

  console.log(`Attendance records to remove: ${attendanceCount}`);
  console.log(`Test marks to remove: ${marksCount}`);
  console.log(`Fee payment records to remove: ${feesCount}`);
  console.log(`Payment claims to remove: ${claimsCount}`);
  console.log(`Push subscriptions to remove: ${pushCount}`);
  console.log(`Password reset tokens to remove (all, transient): ${tokenCount}`);

  if (DRY_RUN) {
    console.log('\nDRY RUN ONLY — nothing deleted. Set DRY_RUN = false to actually delete.');
    await mongoose.disconnect();
    return;
  }

  await Attendance.deleteMany({ studentId: { $in: studentIds } });
  await TestMark.deleteMany({ studentId: { $in: studentIds } });
  await FeePayment.deleteMany({ studentId: { $in: studentIds } });
  await PaymentClaim.deleteMany({ studentId: { $in: studentIds } });
  await PushSubscription.deleteMany({
    $or: [
      { userType: 'student' },
      { userType: 'staff', userId: { $in: teacherIds } },
    ],
  });
  await PasswordResetToken.deleteMany({});
  await Student.deleteMany({});
  await User.deleteMany({ role: 'teacher' });

  console.log('\n✅ Cleanup complete. All teacher and student accounts + their data removed. Admin accounts untouched.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
