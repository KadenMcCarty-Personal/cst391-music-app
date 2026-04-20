import { getPool } from '@/lib/db';
import { Playlist, PlaylistTrack } from '@/lib/types';

export async function getAllPlaylistsAdmin(): Promise<Playlist[]> {
  const pool = getPool();
  const { rows } = await pool.query('SELECT * FROM playlists ORDER BY id');
  return rows as Playlist[];
}

export async function getAllPlaylists(userId?: string): Promise<Playlist[]> {
  const pool = getPool();
  if (userId) {
    const { rows } = await pool.query(
      'SELECT * FROM playlists WHERE user_id = $1 OR is_public = TRUE ORDER BY id',
      [userId]
    );
    return rows as Playlist[];
  }
  const { rows } = await pool.query(
    'SELECT * FROM playlists WHERE is_public = TRUE ORDER BY id'
  );
  return rows as Playlist[];
}

export async function getPlaylistById(playlistId: number): Promise<Playlist | null> {
  const pool = getPool();
  const { rows: playlists } = await pool.query(
    'SELECT * FROM playlists WHERE id = $1',
    [playlistId]
  );
  if (playlists.length === 0) return null;

  const { rows: tracks } = await pool.query(
    `SELECT stp.id, stp.playlist_id, stp.track_id, stp.position,
            t.title, t.number, t.lyrics, t.video_url, t.album_id
     FROM songtoplaylist stp
     JOIN tracks t ON t.id = stp.track_id
     WHERE stp.playlist_id = $1
     ORDER BY stp.position`,
    [playlistId]
  );

  return { ...playlists[0], tracks: tracks as PlaylistTrack[] };
}

export async function createPlaylist(
  name: string,
  userId: number | null,
  isPublic: boolean
): Promise<Playlist> {
  const pool = getPool();
  const { rows } = await pool.query(
    'INSERT INTO playlists (name, user_id, is_public) VALUES ($1, $2, $3) RETURNING *',
    [name, userId, isPublic]
  );
  return rows[0] as Playlist;
}

export async function updatePlaylist(
  playlistId: number,
  name?: string,
  isPublic?: boolean
): Promise<Playlist | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    `UPDATE playlists SET
      name = COALESCE($1, name),
      is_public = COALESCE($2, is_public)
     WHERE id = $3 RETURNING *`,
    [name ?? null, isPublic ?? null, playlistId]
  );
  return rows.length > 0 ? (rows[0] as Playlist) : null;
}

export async function deletePlaylist(playlistId: number): Promise<boolean> {
  const pool = getPool();
  const { rowCount } = await pool.query(
    'DELETE FROM playlists WHERE id = $1',
    [playlistId]
  );
  return (rowCount ?? 0) > 0;
}

export async function addTrackToPlaylist(
  playlistId: number,
  trackId: number
): Promise<PlaylistTrack> {
  const pool = getPool();
  const { rows: posRows } = await pool.query(
    'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM songtoplaylist WHERE playlist_id = $1',
    [playlistId]
  );
  const position = posRows[0].next_pos;
  const { rows } = await pool.query(
    'INSERT INTO songtoplaylist (playlist_id, track_id, position) VALUES ($1, $2, $3) RETURNING *',
    [playlistId, trackId, position]
  );
  return rows[0] as PlaylistTrack;
}

export async function removeTrackFromPlaylist(
  playlistId: number,
  trackId: number
): Promise<boolean> {
  const pool = getPool();
  const { rowCount } = await pool.query(
    'DELETE FROM songtoplaylist WHERE playlist_id = $1 AND track_id = $2',
    [playlistId, trackId]
  );
  return (rowCount ?? 0) > 0;
}

export async function reorderTracks(
  playlistId: number,
  order: { track_id: number; position: number }[]
): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of order) {
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
}

export async function setPlaylistVisibility(
  playlistId: number,
  isPublic: boolean
): Promise<Playlist | null> {
  const pool = getPool();
  const { rows } = await pool.query(
    'UPDATE playlists SET is_public = $1 WHERE id = $2 RETURNING *',
    [isPublic, playlistId]
  );
  return rows.length > 0 ? (rows[0] as Playlist) : null;
}
