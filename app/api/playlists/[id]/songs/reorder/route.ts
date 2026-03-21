import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

// PUT /api/playlists/[id]/songs/reorder - reorder tracks in a playlist
// Body: { order: [{ track_id: number, position: number }] }
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
    const { order } = body;

    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: 'Missing required field: order (array)' }, { status: 400 });
    }

    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      for (const item of order as { track_id: number; position: number }[]) {
        await client.query(
          'UPDATE songtoplaylist SET position = $1 WHERE playlist_id = $2 AND track_id = $3',
          [item.position, playlistId, item.track_id]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ message: 'Playlist reordered successfully' });
  } catch (error) {
    console.error(`PUT /api/playlists/${id}/songs/reorder error:`, error);
    return NextResponse.json({ error: 'Failed to reorder playlist' }, { status: 500 });
  }
}
