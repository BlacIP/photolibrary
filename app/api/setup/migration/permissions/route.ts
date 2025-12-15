
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;
      `);
      return NextResponse.json({ message: 'Migration successful: permissions column added' });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
