import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Find the first user created
    const { rows } = await pool.query('SELECT id, email FROM users ORDER BY created_at ASC LIMIT 1');
    
    if (rows.length === 0) {
        return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }

    const firstUser = rows[0];

    // Promote to SUPER_ADMIN_MAX
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['SUPER_ADMIN_MAX', firstUser.id]);

    return NextResponse.json({ 
        message: 'Success: Promoted first user to Owner (SUPER_ADMIN_MAX)',
        user: firstUser
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
