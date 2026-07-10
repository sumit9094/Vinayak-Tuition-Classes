import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Manually load .env.local environment variables before any other imports
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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Error: ADMIN_EMAIL or ADMIN_PASSWORD is not defined in .env.local');
    process.exit(1);
  }

  try {
    // Dynamically import Mongoose connection and User model after env is loaded
    const { connectDB } = await import('../src/lib/mongodb');
    const User = (await import('../src/models/User')).default;
    const { BRANCHES } = await import('../src/lib/constants');

    console.log('Connecting to database...');
    await connectDB();

    console.log('Checking if Admin already exists...');
    const adminUser = await User.findOne({ role: 'admin' });
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (adminUser) {
      console.log('Admin exists. Updating password...');
      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log('Admin password updated successfully!');
    } else {
      console.log('Creating Admin user...');
      const newAdmin = new User({
        name: 'Chirag Sir',
        email: ADMIN_EMAIL.toLowerCase(),
        phone: '9228174188',
        password: hashedPassword,
        role: 'admin',
        branches: [...BRANCHES], // Admin gets both branches
      });
      await newAdmin.save();
      console.log('Admin user seeded successfully!');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed with error:', error);
    process.exit(1);
  }
}

seedAdmin();
