import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await pool.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS subheading TEXT');
    return NextResponse.json({ message: 'Migration successful: Added subheading column' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
