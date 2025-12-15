import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { pool } from '@/lib/db';

export async function GET() {
  const session = cookies().get('session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const payload = await decrypt(session);
    const sessionUser = (payload as any).user;

    // Fetch fresh data from DB to get names and permissions
    const { rows } = await pool.query('SELECT id, email, first_name, last_name, role, permissions FROM users WHERE id = $1', [sessionUser.id]);
    
    if (rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const user = rows[0];
    return NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        permissions: user.permissions || [] 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
