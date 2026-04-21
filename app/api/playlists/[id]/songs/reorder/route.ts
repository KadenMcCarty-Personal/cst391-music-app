import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as playlistService from '@/lib/services/playlistService';
import { ServiceError } from '@/lib/services/playlistService';

export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) {
    return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });
  }

  try {
    const existing = await playlistService.getPlaylist(playlistId);
    const isAdmin = session.user?.role === 'admin';
    if (!isAdmin && existing.user_id !== session.user?.githubId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { order } = body;
    await playlistService.reorderTracks(playlistId, order);
    return NextResponse.json({ message: 'Playlist reordered successfully' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`PUT /api/playlists/${id}/songs/reorder error:`, error);
    return NextResponse.json({ error: 'Failed to reorder playlist' }, { status: 500 });
  }
}
