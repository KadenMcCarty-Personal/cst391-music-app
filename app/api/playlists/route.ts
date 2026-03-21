import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { Playlist } from '@/lib/types';

export const runtime = 'nodejs';

// GET /api/playlists - get all public playlists (or all if user_id provided)
export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    let rows;
    if (userId) {
      ({ rows } = await pool.query(
        'SELECT * FROM playlists WHERE user_id = $1 OR is_public = TRUE ORDER BY id',
        [userId]
      ));
    } else {
      ({ rows } = await pool.query(
        'SELECT * FROM playlists WHERE is_public = TRUE ORDER BY id'
      ));
    }

    return NextResponse.json(rows as Playlist[]);
  } catch (error) {
    console.error('GET /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

// POST /api/playlists - create a new playlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, user_id, is_public } = body;

    if (!name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }

    const pool = getPool();
    const { rows } = await pool.query(
      'INSERT INTO playlists (name, user_id, is_public) VALUES ($1, $2, $3) RETURNING *',
      [name, user_id ?? null, is_public ?? true]
    );

    return NextResponse.json(rows[0] as Playlist, { status: 201 });
  } catch (error) {
    console.error('POST /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
