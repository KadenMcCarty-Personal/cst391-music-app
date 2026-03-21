import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { Playlist } from '@/lib/types';

export const runtime = 'nodejs';

// PUT /api/admin/playlists/[id]/visibility - admin: toggle a playlist's public/private status
// Body: { is_public: boolean }
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) {
    return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { is_public } = body;

    if (typeof is_public !== 'boolean') {
      return NextResponse.json({ error: 'Missing required field: is_public (boolean)' }, { status: 400 });
    }

    const pool = getPool();
    const { rows } = await pool.query(
      'UPDATE playlists SET is_public = $1 WHERE id = $2 RETURNING *',
      [is_public, playlistId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0] as Playlist);
  } catch (error) {
    console.error(`PUT /api/admin/playlists/${id}/visibility error:`, error);
    return NextResponse.json({ error: 'Failed to update playlist visibility' }, { status: 500 });
  }
}
