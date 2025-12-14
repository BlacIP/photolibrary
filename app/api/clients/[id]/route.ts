import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fetch Client
    const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    
    if (clientResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    const client = clientResult.rows[0];

    // Fetch Photos
    const photosResult = await pool.query(
      'SELECT * FROM photos WHERE client_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Construct response object
    const response = {
      id: client.id,
      name: client.name,
      eventDate: client.event_date,
      slug: client.slug,
      createdAt: client.created_at,
      photos: photosResult.rows.map(p => ({
        id: p.id,
        url: p.url,
        publicId: p.public_id,
        filename: p.filename,
        clientId: p.client_id,
        createdAt: p.created_at
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
