import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { slug } = await context.params;
  const albumId = parseInt(slug, 10);
  if (isNaN(albumId)) {
    return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title } = body;
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 });
    }

    const pool = getPool();

    const { rows: albumRows } = await pool.query('SELECT id FROM albums WHERE id = $1', [albumId]);
    if (albumRows.length === 0) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    const { rows: numRows } = await pool.query(
      'SELECT COALESCE(MAX(number), 0) + 1 AS next_num FROM tracks WHERE album_id = $1',
      [albumId]
    );
    const nextNum = numRows[0].next_num;

    const { rows } = await pool.query(
      'INSERT INTO tracks (album_id, title, number) VALUES ($1, $2, $3) RETURNING *',
      [albumId, title.trim(), nextNum]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error(`POST /api/albums/${slug}/tracks error:`, error);
    return NextResponse.json({ error: 'Failed to add track' }, { status: 500 });
  }
}
