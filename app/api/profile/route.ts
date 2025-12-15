import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt, hash, compare } from '@/lib/auth';
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

export async function PUT(req: NextRequest) {
  const currentUser = await getSessionUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { firstName, lastName, currentPassword, newPassword } = body;

    // Password Update Logic
    if (newPassword) {
        if (!currentPassword) {
            return NextResponse.json({ error: 'Current password required' }, { status: 400 });
        }

        // Fetch current user hash
        const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [currentUser.id]);
        if (rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        
        const valid = await compare(currentPassword, rows[0].password_hash);
        if (!valid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });

        const newHash = await hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, currentUser.id]);
    }

    // Profile Info Update
    if (firstName !== undefined || lastName !== undefined) {
         await pool.query(
            'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name) WHERE id = $3',
            [firstName, lastName, currentUser.id]
         );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
