import { pool } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;

    if (!file || !clientId) {
      return NextResponse.json(
        { error: 'File and clientId are required' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `photolibrary/${clientId}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Save to Database
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO photos (id, url, public_id, filename, client_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [
      id,
      result.secure_url,
      result.public_id,
      file.name,
      clientId
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
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: (error as Error).message }, { status: 500 });
  }
}
