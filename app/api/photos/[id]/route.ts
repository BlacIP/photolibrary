
import { pool } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getAuthenticatedUser() {
  const session = cookies().get('session')?.value;
  if (!session) return null;
  try {
    const payload = await decrypt(session);
    const sessionUser = (payload as any).user;
    
    // Fetch fresh user from DB to get permissions
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [sessionUser.id]);
    if (rows.length === 0) return null;
    return rows[0];
  } catch {
    return null;
  }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check Permissions
  const permissions = user.permissions || [];
  const canDelete = ['SUPER_ADMIN', 'SUPER_ADMIN_MAX'].includes(user.role) || permissions.includes('manage_photos') || permissions.includes('delete_photos');

  if (!canDelete) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = params.id;

  try {
    // Get photo public_id
    const { rows } = await pool.query('SELECT public_id FROM photos WHERE id = $1', [id]);
    if (rows.length === 0) {
        return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    const publicId = rows[0].public_id;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete from DB
    await pool.query('DELETE FROM photos WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
