import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

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
  const currentUser = await getSessionUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['SUPER_ADMIN', 'SUPER_ADMIN_MAX'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, date, subheading } = body;

    if (!name || !date) {
      return NextResponse.json(
        { error: 'Name and date are required' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    const id = crypto.randomUUID();
    const eventDate = new Date(date).toISOString();

    const query = `
      INSERT INTO clients (id, name, slug, event_date, subheading)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [id, name, uniqueSlug, eventDate, subheading || null]);
    
    // Transform snake_case to camelCase for frontend compatibility if needed, 
    // or just assume frontend adapts. Let's adapt frontend types later or return camelCase here.
    // For simplicity, let's keep database fields snake_case but map them to camelCase in response
    // to match previous Prisma behavior.
    const client = rows[0];
    const mappedClient = {
      id: client.id,
      name: client.name,
      slug: client.slug,
      eventDate: client.event_date,
      createdAt: client.created_at
    };

    return NextResponse.json(mappedClient);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Left Join to count photos
    const query = `
      SELECT c.*, COUNT(p.id) as photo_count
      FROM clients c
      LEFT JOIN photos p ON c.id = p.client_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    
    const { rows } = await pool.query(query);

    const clients = rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      eventDate: row.event_date,
      createdAt: row.created_at,
      status: row.status || 'ACTIVE',
      statusUpdatedAt: row.status_updated_at,
      subheading: row.subheading,
      _count: {
        photos: parseInt(row.photo_count || '0')
      }
    }));

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}
