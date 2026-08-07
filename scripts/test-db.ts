import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Load .env.local
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

async function run() {
  const { connectDB } = await import('../src/lib/mongodb');
  const User = (await import('../src/models/User')).default;

  console.log('Connecting to database...');
  await connectDB();

  console.log('Fetching users...');
  const users = await User.find({});
  console.log(`Found ${users.length} user(s):`);
  for (const user of users) {
    console.log({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: user.password
    });
  }

  await mongoose.connection.close();
  console.log('Done!');
}

run().catch(console.error);
