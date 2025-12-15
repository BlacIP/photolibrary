import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
        // Add 'size' to photos table
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='photos' AND column_name='size') THEN 
                    ALTER TABLE photos ADD COLUMN size BIGINT DEFAULT 0; 
                END IF; 
            END $$;
        `);

        // Add 'status_updated_at' to clients table
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='status_updated_at') THEN 
                    ALTER TABLE clients ADD COLUMN status_updated_at TIMESTAMP DEFAULT NOW(); 
                END IF; 
            END $$;
        `);
        
        return NextResponse.json({ message: 'Migration successful: Added size and status_updated_at columns' });
    } finally {
        client.release();
    }
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: (error as Error).message }, { status: 500 });
  }
}
