import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  try {
      const client = await pool.connect();
      try {
          // Find photos with 0 size
          const { rows } = await client.query('SELECT id, public_id FROM photos WHERE size = 0 OR size IS NULL');
          
          let updatedCount = 0;
          let errors = [];

          // Process in chunks to avoid overwhelming Cloudinary API
          const chunkSize = 5;
          for (let i = 0; i < rows.length; i += chunkSize) {
              const chunk = rows.slice(i, i + chunkSize);
              await Promise.all(chunk.map(async (photo) => {
                  try {
                      // Get resource details
                      const result = await cloudinary.api.resource(photo.public_id);
                      if (result && result.bytes) {
                          await client.query('UPDATE photos SET size = $1 WHERE id = $2', [result.bytes, photo.id]);
                          updatedCount++;
                      }
                  } catch (err: any) {
                      console.error(`Failed to fetch size for ${photo.public_id}:`, err.message);
                      errors.push({ id: photo.id, error: err.message });
                  }
              }));
          }

          return NextResponse.json({ 
              message: 'Backfill complete', 
              totalFound: rows.length, 
              updated: updatedCount, 
              errors 
          });

      } finally {
          client.release();
      }
  } catch (error) {
      console.error('Backfill error:', error);
      return NextResponse.json({ error: 'Backfill failed' }, { status: 500 });
  }
}
