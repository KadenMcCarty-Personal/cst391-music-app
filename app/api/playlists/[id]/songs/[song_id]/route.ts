import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as playlistService from '@/lib/services/playlistService';
import { ServiceError } from '@/lib/services/playlistService';

export const runtime = 'nodejs';

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string; song_id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, song_id } = await context.params;
  const playlistId = parseInt(id, 10);
  const trackId = parseInt(song_id, 10);

  if (isNaN(playlistId) || isNaN(trackId)) {
    return NextResponse.json({ error: 'Invalid playlist or track ID' }, { status: 400 });
  }

  try {
    const existing = await playlistService.getPlaylist(playlistId);
    const isAdmin = session.user?.role === 'admin';
    if (!isAdmin && existing.user_id !== session.user?.githubId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await playlistService.removeTrack(playlistId, trackId);
    return NextResponse.json({ message: `Track ${trackId} removed from playlist ${playlistId}` });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`DELETE /api/playlists/${id}/songs/${song_id} error:`, error);
    return NextResponse.json({ error: 'Failed to remove track from playlist' }, { status: 500 });
  }
}
