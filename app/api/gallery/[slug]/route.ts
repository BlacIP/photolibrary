import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    // Fetch Client
    const clientResult = await pool.query('SELECT * FROM clients WHERE slug = $1', [slug]);
    
    if (clientResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    const client = clientResult.rows[0];

    // Fetch Photos
    const photosResult = await pool.query(
      'SELECT id, url, filename, public_id, created_at FROM photos WHERE client_id = $1 ORDER BY created_at DESC',
      [client.id]
    );

    // Construct response object
    const response = {
      id: client.id,
      name: client.name,
      slug: client.slug,
      event_date: client.event_date,
      subheading: client.subheading,
      status: client.status || 'ACTIVE',
      header_media_url: client.header_media_url,
      header_media_type: client.header_media_type,
      photos: photosResult.rows
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
