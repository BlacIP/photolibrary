import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    let currentUser;
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [sessionUser.id]);
      if (rows.length > 0) currentUser = rows[0];
    }

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, publicId, url } = await req.json();

    if (!clientId || !publicId || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract filename from public_id
    const filename = publicId.split('/').pop() || 'uploaded_file';

    // Save to database
    await pool.query(
      'INSERT INTO photos (client_id, url, filename, public_id, uploaded_by) VALUES ($1, $2, $3, $4, $5)',
      [clientId, url, filename, publicId, currentUser.id]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving photo record:', error);
    return NextResponse.json({ error: 'Failed to save photo record' }, { status: 500 });
  }
}
