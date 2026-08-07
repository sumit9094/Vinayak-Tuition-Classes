import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface SessionPayload {
  userId?: string;
  studentId?: string;
  role?: 'admin' | 'teacher';
  type?: 'student' | 'staff';
  branch?: string;
  branches?: string[];
  standards?: string[];
  subject?: string;
  [key: string]: any;
}

/**
 * Reads the `auth_token` cookie and verifies it against JWT_SECRET.
 * Returns the decoded session payload, or null if missing/invalid/expired.
 *
 * Shared across all API routes so JWT verification logic lives in one place
 * instead of being copy-pasted into every route file.
 */
export async function getSession(): Promise<SessionPayload | null> {
  if (!JWT_SECRET) {
    // Fail closed: never attempt to verify against an empty/undefined secret.
    console.error('[auth] JWT_SECRET is not configured — refusing to verify session.');
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch (e) {
    return null;
  }
}
