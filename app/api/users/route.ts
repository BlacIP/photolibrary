import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt, hash } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getSessionUser() {
  const session = cookies().get('session')?.value;
  if (!session) return null;
  try {
    const payload = await decrypt(session);
    return (payload as any).user;
  } catch {
    return null;
  }
}

export async function GET() {
  const currentUser = await getSessionUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only Super Admins should ideally see all users, but Admins might need to see themselves?
  // User asked for "Super Admin user will have access to user management".
  if (!['SUPER_ADMIN', 'SUPER_ADMIN_MAX'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { rows } = await pool.query('SELECT id, email, first_name, last_name, role, permissions, created_at FROM users ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const currentUser = await getSessionUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (currentUser.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const roleInput = body.role;
    // Explicitly disallow creating SUPER_ADMIN_MAX directly via API
    if (roleInput === 'SUPER_ADMIN_MAX') {
        return NextResponse.json({ error: 'Cannot create Owner role directly' }, { status: 403 });
    }
    
    // Only allow SUPER_ADMIN or ADMIN
    const role = roleInput === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';

    const passwordHash = await hash(password, 10);
    const id = crypto.randomUUID();

    await pool.query(
      'INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, email, passwordHash, firstName || null, lastName || null, role]
    );

    return NextResponse.json({ id, email, role: 'ADMIN' });
  } catch (error) {
    if ((error as any).code === '23505') { // Unique violation
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
