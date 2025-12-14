import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { compare, encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Find User
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify Password
    const isValid = await compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create Session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({ 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }, 
      expires 
    });

    // Set Cookie
    cookies().set('session', session, { expires, httpOnly: true });

    return NextResponse.json({ 
      user: { id: user.id, email: user.email, role: user.role } 
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
