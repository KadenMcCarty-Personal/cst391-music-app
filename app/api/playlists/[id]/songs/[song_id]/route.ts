import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

// DELETE /api/playlists/[id]/songs/[song_id] - remove a track from a playlist
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; song_id: string }> }
) {
  const { id, song_id } = await context.params;
  const playlistId = parseInt(id, 10);
  const trackId = parseInt(song_id, 10);

  if (isNaN(playlistId) || isNaN(trackId)) {
    return NextResponse.json({ error: 'Invalid playlist or track ID' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const { rowCount } = await pool.query(
      'DELETE FROM songtoplaylist WHERE playlist_id = $1 AND track_id = $2',
      [playlistId, trackId]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Track not found in playlist' }, { status: 404 });
    }

    return NextResponse.json({ message: `Track ${trackId} removed from playlist ${playlistId}` });
  } catch (error) {
    console.error(`DELETE /api/playlists/${id}/songs/${song_id} error:`, error);
    return NextResponse.json({ error: 'Failed to remove track from playlist' }, { status: 500 });
  }
}
