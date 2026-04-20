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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) {
    return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { is_public } = body;
    const playlist = await playlistService.setVisibility(playlistId, is_public);
    return NextResponse.json(playlist);
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`PUT /api/admin/playlists/${id}/visibility error:`, error);
    return NextResponse.json({ error: 'Failed to update playlist visibility' }, { status: 500 });
  }
}
