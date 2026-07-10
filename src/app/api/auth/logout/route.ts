import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the auth_token cookie by setting maxAge to 0
    cookieStore.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json(
      { error: 'Logout failed due to a server error' },
      { status: 500 }
    );
  }
}
