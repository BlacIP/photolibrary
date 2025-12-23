import { NextRequest, NextResponse } from 'next/server';
import { signUploadRequest } from '@/lib/cloudinary';
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

    // Check permissions
    const canUpload = currentUser.role === 'SUPER_ADMIN' || 
                     (currentUser.permissions && currentUser.permissions.includes('upload_photos'));
    
    if (!canUpload) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    // Verify client exists
    const clientCheck = await pool.query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (clientCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Generate upload signature for direct client-to-Cloudinary upload
    const folder = `photolibrary/${clientId}`;
    const { timestamp, signature, folder: envFolder } = await signUploadRequest(folder);

    return NextResponse.json({
      timestamp,
      signature,
      folder: envFolder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL?.split('@')[1],
      apiKey: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.split(':')[1]?.split('@')[0],
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    return NextResponse.json({ error: 'Failed to generate upload signature' }, { status: 500 });
  }
}
