import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as playlistService from '@/lib/services/playlistService';
import { ServiceError } from '@/lib/services/playlistService';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) {
    return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });
  }

  try {
    const playlist = await playlistService.getPlaylist(playlistId);
    return NextResponse.json(playlist);
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`GET /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}

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
    const { name, is_public } = body;
    const playlist = await playlistService.updatePlaylist(playlistId, name, is_public);
    return NextResponse.json(playlist);
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`PUT /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
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

    await playlistService.deletePlaylist(playlistId);
    return NextResponse.json({ message: `Playlist ${playlistId} deleted` });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`DELETE /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
