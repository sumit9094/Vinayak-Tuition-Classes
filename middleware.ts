import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper to decode base64url to binary string
function base64urlDecode(str: string) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

// Verify HS256 signature using native Web Crypto API (Edge-safe)
async function verifyHS256(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [headerStr, payloadStr, signatureStr] = parts;
  const data = `${headerStr}.${payloadStr}`;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const dataData = encoder.encode(data);

    // Import key
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode signature
    const binSig = base64urlDecode(signatureStr);
    const sigBytes = new Uint8Array(binSig.length);
    for (let i = 0; i < binSig.length; i++) {
      sigBytes[i] = binSig.charCodeAt(i);
    }

    // Verify signature
    return await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      dataData
    );
  } catch (e) {
    console.error('Middleware JWT Verification Error:', e);
    return false;
  }
}

// Check if token has expired
function isExpired(token: string): boolean {
  try {
    const payloadPart = token.split('.')[1];
    const payload = JSON.parse(base64urlDecode(payloadPart));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const loginUrl = new URL('/login', req.url);
  const pathname = req.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  const secret = process.env.JWT_SECRET || '';
  const isValid = await verifyHS256(token, secret);
  const expired = isExpired(token);

  if (!isValid || expired) {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }

  try {
    // Decode JWT payload to verify roles
    const payloadPart = token.split('.')[1];
    const payload = JSON.parse(base64urlDecode(payloadPart));

    // Admin dashboard protection
    if (pathname === '/admin/dashboard' || pathname.startsWith('/admin/dashboard/')) {
      if (payload.role !== 'admin') {
        return NextResponse.redirect(loginUrl);
      }
    }

    // Teacher dashboard protection
    if (pathname === '/teacher/dashboard' || pathname.startsWith('/teacher/dashboard/')) {
      if (payload.role !== 'teacher' && payload.role !== 'admin') {
        return NextResponse.redirect(loginUrl);
      }
    }

    // Student dashboard protection
    if (pathname === '/student/dashboard' || pathname.startsWith('/student/dashboard/')) {
      if (payload.type !== 'student') {
        return NextResponse.redirect(loginUrl);
      }
    }
  } catch (err) {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard',
    '/admin/dashboard/:path*',
    '/teacher/dashboard',
    '/teacher/dashboard/:path*',
    '/student/dashboard',
    '/student/dashboard/:path*',
  ],
};
