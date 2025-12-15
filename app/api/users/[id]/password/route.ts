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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUser = await getSessionUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (currentUser.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
        return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);
    
    // Convert params.id to string explicitly to avoid type error if needed, though usually string
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, params.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
