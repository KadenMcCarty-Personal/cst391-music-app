import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { Playlist, PlaylistTrack } from '@/lib/types';

export const runtime = 'nodejs';

// GET /api/admin/playlists/[id] - admin: get any playlist (public or private) with tracks
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) {
    return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const { rows: playlists } = await pool.query(
      'SELECT * FROM playlists WHERE id = $1',
      [playlistId]
    );

    if (playlists.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const { rows: tracks } = await pool.query(
      `SELECT stp.id, stp.playlist_id, stp.track_id, stp.position,
              t.title, t.number, t.lyrics, t.video_url, t.album_id
       FROM songtoplaylist stp
       JOIN tracks t ON t.id = stp.track_id
       WHERE stp.playlist_id = $1
       ORDER BY stp.position`,
      [playlistId]
    );

    const playlist: Playlist = {
      ...playlists[0],
      tracks: tracks as PlaylistTrack[],
    };

    return NextResponse.json(playlist);
  } catch (error) {
    console.error(`GET /api/admin/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}

// DELETE /api/admin/playlists/[id] - admin: delete any playlist
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) {
    return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const { rowCount } = await pool.query(
      'DELETE FROM playlists WHERE id = $1',
      [playlistId]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json({ message: `Playlist ${playlistId} deleted by admin` });
  } catch (error) {
    console.error(`DELETE /api/admin/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
