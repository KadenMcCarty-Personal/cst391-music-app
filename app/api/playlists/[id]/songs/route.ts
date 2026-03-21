import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

// POST /api/playlists/[id]/songs - add a track to a playlist
export async function POST(
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
    const { track_id } = body;

    if (track_id == null) {
      return NextResponse.json({ error: 'Missing required field: track_id' }, { status: 400 });
    }

    const pool = getPool();

    // Check playlist exists
    const { rows: playlists } = await pool.query(
      'SELECT id FROM playlists WHERE id = $1',
      [playlistId]
    );
    if (playlists.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Get next position
    const { rows: posRows } = await pool.query(
      'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM songtoplaylist WHERE playlist_id = $1',
      [playlistId]
    );
    const position = posRows[0].next_pos;

    const { rows } = await pool.query(
      'INSERT INTO songtoplaylist (playlist_id, track_id, position) VALUES ($1, $2, $3) RETURNING *',
      [playlistId, track_id, position]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Track already in playlist' }, { status: 409 });
    }
    console.error(`POST /api/playlists/${id}/songs error:`, error);
    return NextResponse.json({ error: 'Failed to add track to playlist' }, { status: 500 });
  }
}
