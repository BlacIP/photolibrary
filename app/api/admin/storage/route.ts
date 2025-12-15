import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  const session = cookies().get('session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let currentUser;
  try {
     const payload = await decrypt(session);
     const sessionUser = (payload as any).user;
     const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [sessionUser.id]);
     if (rows.length > 0) currentUser = rows[0];
  } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only Super Admin or Owner can view storage
  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN_MAX') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
      const client = await pool.connect();
      try {
          // Total Storage
          const totalRes = await client.query('SELECT SUM(size) as total_bytes, COUNT(*) as total_photos FROM photos');
          const totalBytes = parseInt(totalRes.rows[0].total_bytes || '0');
          const totalPhotos = parseInt(totalRes.rows[0].total_photos || '0');

          // Storage by Client (Grouped)
          const clientsRes = await client.query(`
              SELECT 
                  c.id, c.name, c.status, c.status_updated_at,
                  COUNT(p.id) as photo_count,
                  SUM(p.size) as total_bytes
              FROM clients c
              LEFT JOIN photos p ON c.id = p.client_id
              GROUP BY c.id
              ORDER BY total_bytes DESC
          `);

          // Group by Status
          const statusStats = {
              active_bytes: 0,
              archived_bytes: 0,
              deleted_bytes: 0
          };

          clientsRes.rows.forEach(row => {
              const bytes = parseInt(row.total_bytes || '0');
              if (row.status === 'ARCHIVED') statusStats.archived_bytes += bytes;
              else if (row.status === 'DELETED') statusStats.deleted_bytes += bytes;
              else statusStats.active_bytes += bytes;
          });

          // Cloudinary Usage
          let cloudinaryData = null;
          try {
              const usage = await cloudinary.api.usage();
              cloudinaryData = {
                  plan: usage.plan,
                  storage: {
                      used: usage.storage.usage, // Bytes
                      credits_usage: usage.storage.credits_usage
                  },
                  credits: {
                      usage: usage.credits.usage,
                      limit: usage.credits.limit,
                      percent: usage.credits.used_percent
                  }
              };
          } catch (e: any) {
              console.warn('Cloudinary usage error:', e);
              cloudinaryData = { error: e.message || 'Unknown Error' };
          }

          return NextResponse.json({
              totalBytes,
              totalPhotos,
              clients: clientsRes.rows.map(row => ({
                  ...row,
                  total_bytes: parseInt(row.total_bytes || '0'),
                  photo_count: parseInt(row.photo_count || '0')
              })),
              statusStats,
              cloudinary: cloudinaryData
          });
      } finally {
          client.release();
      }


  } catch (error) {
      console.error('Storage stats error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
