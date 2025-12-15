import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import JSZip from 'jszip';

export const maxDuration = 60; // Max execution time for Pro plan
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    // Fetch client and photos
    const clientResult = await pool.query('SELECT * FROM clients WHERE slug = $1', [slug]);
    
    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }
    
    const client = clientResult.rows[0];
    
    // Fetch all photos
    const photosResult = await pool.query(
      'SELECT url, filename FROM photos WHERE client_id = $1 ORDER BY created_at ASC',
      [client.id]
    );
    
    if (photosResult.rows.length === 0) {
      return NextResponse.json({ error: 'No photos to download' }, { status: 404 });
    }
    
    const photos = photosResult.rows;
    
    // Create ZIP file
    const zip = new JSZip();
    
    // Download and add each photo to ZIP
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      try {
        // Fetch image from Cloudinary (no caching to avoid 2MB limit warnings)
        const response = await fetch(photo.url, { cache: 'no-store' });
        if (!response.ok) {
          console.warn(`Failed to fetch ${photo.filename}: ${response.status}`);
          continue;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Add to ZIP with original filename
        zip.file(photo.filename, buffer);
      } catch (error) {
        console.error(`Error downloading ${photo.filename}:`, error);
        // Continue with other photos even if one fails
      }
    }
    
    // Generate ZIP file
    console.log('Generating ZIP file...');
    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 } // Balance between speed and size
    });
    
    // Return ZIP file
    const zipFilename = `${client.name.replace(/[^a-z0-9]/gi, '_')}_Gallery.zip`;
    
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
    
  } catch (error: any) {
    console.error('Error creating ZIP:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    return NextResponse.json(
      { error: 'Failed to create ZIP file', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
