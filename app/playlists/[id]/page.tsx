"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import NavBar from "@/app/components/NavBar";
import { get, post, del, put } from "@/lib/apiClient";
import { Playlist, Album } from "@/lib/types";

export default function PlaylistDetailPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const router = useRouter();
  const params = useParams();
  const playlistId = (params?.id as string) ?? "";

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadPlaylist = async () => {
    try {
      const data = await get<Playlist>(`/playlists/${playlistId}`);
      setPlaylist(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadAlbums = async () => {
    try {
      const data = await get<Album[]>("/albums");
      setAlbums(data);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    void loadPlaylist();
    if (session) void loadAlbums();
  }, [playlistId, session]);

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackId) return;
    setAdding(true);
    try {
      await post(`/playlists/${playlistId}/songs`, { track_id: parseInt(selectedTrackId, 10) });
      setSelectedTrackId("");
      await loadPlaylist();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveTrack = async (trackId: number) => {
    try {
      await del(`/playlists/${playlistId}/songs/${trackId}`);
      await loadPlaylist();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm("Delete this playlist?")) return;
    try {
      await del(`/playlists/${playlistId}`);
      router.push("/playlists");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleToggleVisibility = async () => {
    if (!playlist) return;
    try {
      await put(`/admin/playlists/${playlistId}/visibility`, {
        is_public: !playlist.is_public,
      });
      await loadPlaylist();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <main><NavBar /><div className="container mt-4"><p>Loading...</p></div></main>;

  if (error && !playlist) return (
    <main>
      <NavBar />
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={() => router.push("/playlists")}>Back</button>
      </div>
    </main>
  );

  return (
    <main>
      <NavBar />
      <div className="container mt-4">
        <button className="btn btn-secondary mb-3" onClick={() => router.push("/playlists")}>
          &larr; Back to Playlists
        </button>

        {error && <div className="alert alert-danger">{error}</div>}

        {playlist && (
          <>
            <div className="d-flex align-items-center gap-3 mb-2">
              <h1 className="mb-0">{playlist.name}</h1>
              <span className={`badge ${playlist.is_public ? "bg-success" : "bg-secondary"}`}>
                {playlist.is_public ? "Public" : "Private"}
              </span>
            </div>

            {isAdmin && (
              <div className="mb-4 d-flex gap-2">
                <button className="btn btn-outline-warning btn-sm" onClick={() => void handleToggleVisibility()}>
                  Make {playlist.is_public ? "Private" : "Public"}
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => void handleDeletePlaylist()}>
                  Delete Playlist
                </button>
              </div>
            )}

            <h5>Tracks ({playlist.tracks?.length ?? 0})</h5>

            {playlist.tracks && playlist.tracks.length === 0 && (
              <p className="text-muted">No tracks yet. Add one below!</p>
            )}

            <ul className="list-group mb-4">
              {playlist.tracks?.map((track) => (
                <li key={track.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    <span className="text-muted me-2">#{track.position + 1}</span>
                    {track.title}
                  </span>
                  {session && (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => void handleRemoveTrack(track.track_id)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {session && (
              <div className="card p-3">
                <h6>Add a Song</h6>
                <form onSubmit={(e) => void handleAddTrack(e)} className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={selectedTrackId}
                    onChange={(e) => setSelectedTrackId(e.target.value)}
                    required
                  >
                    <option value="">Select a track...</option>
                    {albums.map((album) =>
                      album.tracks?.map((track) => (
                        <option key={track.id} value={track.id}>
                          {album.title} — {track.title}
                        </option>
                      ))
                    )}
                  </select>
                  <button className="btn btn-primary" type="submit" disabled={adding}>
                    {adding ? "Adding..." : "Add"}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
