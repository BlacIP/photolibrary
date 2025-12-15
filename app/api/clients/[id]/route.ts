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
      subheading: client.subheading,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // session check
  const { cookies } = await import('next/headers');
  const { decrypt } = await import('@/lib/auth');

  const session = cookies().get('session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  let user;
  try {
     const payload = await decrypt(session);
     const sessionUser = (payload as any).user;
     const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [sessionUser.id]);
     if (rows.length > 0) user = rows[0];
  } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const permissions = user.permissions || [];
  const canDelete = ['SUPER_ADMIN', 'SUPER_ADMIN_MAX'].includes(user.role) || permissions.includes('manage_clients'); // Grouping edit/delete under same perm for simplicity, or could separate

  if (!canDelete) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = params.id;
  try {
    // Delete photos first (FK) or rely on CASCADE if configured (but safe to do here)
    await pool.query('DELETE FROM photos WHERE client_id = $1', [id]);
    await pool.query('DELETE FROM clients WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // session check
  const { cookies } = await import('next/headers');
  const { decrypt } = await import('@/lib/auth');

  const session = cookies().get('session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  let user;
  try {
     const payload = await decrypt(session);
     const sessionUser = (payload as any).user;
     // Fetch fresh user
     const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [sessionUser.id]);
     if (rows.length > 0) user = rows[0];
  } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const permissions = user.permissions || [];
  const canEdit = ['SUPER_ADMIN', 'SUPER_ADMIN_MAX'].includes(user.role) || permissions.includes('manage_clients');

  if (!canEdit) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = params.id;
  try {
    const body = await request.json();
    
    // We can have multiple types of updates:
    // 1. Header Media: { headerMediaUrl, headerMediaType }
    // 2. Status: { status }
    // 3. Info: { name, eventDate }
    
    // Construct dynamic query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.headerMediaUrl !== undefined) {
        updates.push(`header_media_url = $${paramIndex++}`);
        values.push(body.headerMediaUrl);
    }
    if (body.headerMediaType !== undefined) {
        updates.push(`header_media_type = $${paramIndex++}`);
        values.push(body.headerMediaType);
    }
    if (body.status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        values.push(body.status);
        updates.push(`status_updated_at = NOW()`);
    }
    if (body.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(body.name);
        
        // Regenerate slug
        const slug = body.name.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars
            .trim()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/-+/g, '-'); // Remove duplicate -
            
        updates.push(`slug = $${paramIndex++}`);
        values.push(slug);
    }
    if (body.subheading !== undefined) {
        updates.push(`subheading = $${paramIndex++}`);
        values.push(body.subheading);
    }
    if (body.eventDate !== undefined) {
        updates.push(`event_date = $${paramIndex++}`);
        values.push(body.eventDate);
    }

    if (updates.length === 0) {
        return NextResponse.json({ success: true }); // Nothing to update
    }

    values.push(id);
    const query = `UPDATE clients SET ${updates.join(', ')} WHERE id = $${paramIndex}`;

    await pool.query(query, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
