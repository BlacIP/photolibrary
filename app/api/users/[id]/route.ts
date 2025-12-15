
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

export async function PUT(
    req: NextRequest, 
    { params }: { params: { id: string } }
) {
  const currentUser = await getSessionUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only Super Admin or Owner can update
  if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN_MAX') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { permissions, role } = body; 
    
    // Check target user role first
    const targetRes = await pool.query('SELECT role FROM users WHERE id = $1', [params.id]);
    if(targetRes.rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const targetUser = targetRes.rows[0];

    // PROTECTION: Targeting an Owner
    if (targetUser.role === 'SUPER_ADMIN_MAX') {
        // Only Owner can edit Owner
        if (currentUser.role !== 'SUPER_ADMIN_MAX') {
             return NextResponse.json({ error: 'Only the Owner can manage the Owner account.' }, { status: 403 });
        }
        // Owner cannot be demoted
        if (role && role !== 'SUPER_ADMIN_MAX') {
             return NextResponse.json({ error: 'Owner role cannot be changed.' }, { status: 400 });
        }
    }

    // PROTECTION: Assigning Owner Role
    if (role === 'SUPER_ADMIN_MAX') {
        return NextResponse.json({ error: 'Cannot assign Owner role manually.' }, { status: 403 });
    }

    // Safeguard: Prevent demoting yourself (Standard Super Admin protection)
    if (currentUser.id === params.id && role && role !== 'SUPER_ADMIN' && role !== 'SUPER_ADMIN_MAX') {
         return NextResponse.json({ error: 'You cannot demote yourself.' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        const queries = [];
        const values = [];
        let queryStr = 'UPDATE users SET permissions = $1';
        values.push(JSON.stringify(permissions || []));
        
        if (role && (role === 'ADMIN' || role === 'SUPER_ADMIN')) {
             queryStr += ', role = $2';
             values.push(role);
             queryStr += ' WHERE id = $3';
             values.push(params.id);
        } else {
             queryStr += ' WHERE id = $2';
             values.push(params.id);
        }

        await client.query(queryStr, values);
    } finally {
        client.release();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
