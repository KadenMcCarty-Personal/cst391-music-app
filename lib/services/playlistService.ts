import * as repo from '@/lib/repositories/playlistRepository';
import { Playlist, PlaylistTrack } from '@/lib/types';

export class ServiceError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function listPlaylists(userId?: string): Promise<Playlist[]> {
  return repo.getAllPlaylists(userId);
}

export async function listAllPlaylistsAdmin(): Promise<Playlist[]> {
  return repo.getAllPlaylistsAdmin();
}

export async function getPlaylist(playlistId: number): Promise<Playlist> {
  const playlist = await repo.getPlaylistById(playlistId);
  if (!playlist) throw new ServiceError(404, 'Playlist not found');
  return playlist;
}

export async function createPlaylist(
  name: string,
  userId: number | null,
  isPublic: boolean
): Promise<Playlist> {
  if (!name?.trim()) throw new ServiceError(400, 'Missing required field: name');
  return repo.createPlaylist(name.trim(), userId, isPublic);
}

export async function updatePlaylist(
  playlistId: number,
  name?: string,
  isPublic?: boolean
): Promise<Playlist> {
  const updated = await repo.updatePlaylist(playlistId, name, isPublic);
  if (!updated) throw new ServiceError(404, 'Playlist not found');
  return updated;
}

export async function deletePlaylist(playlistId: number): Promise<void> {
  const deleted = await repo.deletePlaylist(playlistId);
  if (!deleted) throw new ServiceError(404, 'Playlist not found');
}

export async function addTrack(
  playlistId: number,
  trackId: number
): Promise<PlaylistTrack> {
  const playlist = await repo.getPlaylistById(playlistId);
  if (!playlist) throw new ServiceError(404, 'Playlist not found');
  return repo.addTrackToPlaylist(playlistId, trackId);
}

export async function removeTrack(
  playlistId: number,
  trackId: number
): Promise<void> {
  const removed = await repo.removeTrackFromPlaylist(playlistId, trackId);
  if (!removed) throw new ServiceError(404, 'Track not found in playlist');
}

export async function reorderTracks(
  playlistId: number,
  order: { track_id: number; position: number }[]
): Promise<void> {
  if (!Array.isArray(order) || order.length === 0) {
    throw new ServiceError(400, 'Missing required field: order (array)');
  }
  await repo.reorderTracks(playlistId, order);
}

export async function setVisibility(
  playlistId: number,
  isPublic: boolean
): Promise<Playlist> {
  if (typeof isPublic !== 'boolean') {
    throw new ServiceError(400, 'Missing required field: is_public (boolean)');
  }
  const updated = await repo.setPlaylistVisibility(playlistId, isPublic);
  if (!updated) throw new ServiceError(404, 'Playlist not found');
  return updated;
}
