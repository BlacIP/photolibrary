import { pool } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';
import { NextRequest, NextResponse } from 'next/server';

import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export const maxDuration = 60; // 5 minutes (max for Pro, use 10 for Hobby if needed, but 60 is safer safe default)
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
  // Fetch fresh user for permissions
  let currentUser;
  try {
     const sessionUser = await getSessionUser();
     if (sessionUser) {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [sessionUser.id]);
        if (rows.length > 0) currentUser = rows[0];
     }
  } catch (e) {
      console.error(e);
  }

  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const permissions = currentUser.permissions || [];
  const canUpload = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SUPER_ADMIN_MAX' || permissions.includes('manage_photos') || permissions.includes('upload_photos');

  if (!canUpload) {
    console.error(`Upload blocked: User ${currentUser.email} (${currentUser.role}) lacks permission`);
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;
    const skipDb = formData.get('skipDb') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Cloudinary
    const folder = clientId && clientId !== 'undefined' ? `photolibrary/${clientId}` : 'photolibrary/misc';
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
        },
        (error, result) => {
          if (error) reject(error);
          else if (!result) reject(new Error('Upload result is undefined'));
          else resolve(result);
        }
      ).end(buffer);
    });

    // If skipDb is true or clientId is 'headers' (legacy from UI), return result without DB insert
    if (skipDb || clientId === 'headers') {
        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            filename: file.name
        });
    }

    // Save to Database
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO photos (id, url, public_id, filename, client_id, size)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    // Ensure clientId is valid UUID
    if (!clientId || clientId.length !== 36) { 
         console.warn('Skipping DB insert due to invalid UUID:', clientId);
         return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            filename: file.name
        });
    }

    const { rows } = await pool.query(query, [
      id,
      result.secure_url,
      result.public_id,
      file.name,
      clientId,
      (result as any).bytes || 0 // access bytes from cloudinary result
    ]);

    const photo = rows[0];
    // Map to camelCase
    const mappedPhoto = {
      id: photo.id,
      url: photo.url,
      publicId: photo.public_id,
      filename: photo.filename,
      clientId: photo.client_id,
      createdAt: photo.created_at
    };

    return NextResponse.json(mappedPhoto);
  } catch (error: any) {
    console.error('Upload error:', error);
    // Return specific Cloudinary error message if available
    const errorMsg = error.message || (error.error && error.error.message) || 'Upload failed';
    return NextResponse.json({ error: errorMsg, details: error }, { status: 500 });
  }
}
