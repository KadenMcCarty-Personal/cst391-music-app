import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as playlistService from '@/lib/services/playlistService';
import { ServiceError } from '@/lib/services/playlistService';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id') ?? undefined;
    const playlists = await playlistService.listPlaylists(userId);
    return NextResponse.json(playlists);
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('GET /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, user_id, is_public } = body;
    const playlist = await playlistService.createPlaylist(name, user_id ?? null, is_public ?? true);
    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('POST /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
