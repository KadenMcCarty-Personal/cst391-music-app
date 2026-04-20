"use client";

import { get, post } from "@/lib/apiClient";
import { Album, Playlist } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import NavBar from "@/app/components/NavBar";

export default function ShowAlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params?.albumId;
  const { data: session } = useSession();
  const githubId = session?.user?.githubId;

  const [album, setAlbum] = useState<Album | null>(null);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [openTrackId, setOpenTrackId] = useState<number | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [feedback, setFeedback] = useState<{ trackId: number; msg: string } | null>(null);

  useEffect(() => {
    if (!albumId) return;
    void (async () => {
      const res = await get<Album>(`/albums?albumId=${albumId}`);
      setAlbum(Array.isArray(res) ? res[0] : res);
    })();
  }, [albumId]);

  useEffect(() => {
    if (!githubId) return;
    void (async () => {
      const data = await get<Playlist[]>(`/playlists?user_id=${githubId}`);
      setMyPlaylists(data);
    })();
  }, [githubId]);

  const handleAddToPlaylist = async (trackId: number) => {
    if (!selectedPlaylistId) return;
    try {
      await post(`/playlists/${selectedPlaylistId}/songs`, { track_id: trackId });
      setFeedback({ trackId, msg: "Added!" });
      setOpenTrackId(null);
      setSelectedPlaylistId("");
      setTimeout(() => setFeedback(null), 2000);
    } catch (err) {
      setFeedback({ trackId, msg: (err as Error).message });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const toggleOpen = (trackId: number) => {
    if (openTrackId === trackId) {
      setOpenTrackId(null);
      setSelectedPlaylistId("");
    } else {
      setOpenTrackId(trackId);
      setSelectedPlaylistId("");
    }
  };

  if (!album) return (
    <main>
      <NavBar />
      <p style={{ padding: "1rem" }}>Loading...</p>
    </main>
  );

  return (
    <main style={{ padding: "1rem" }}>
      <NavBar />
      <button className="btn btn-secondary mb-3" onClick={() => router.push("/")}>
        &larr; Home
      </button>
      <div className="d-flex gap-4 flex-wrap">
        {album.image && (
          <img
            src={album.image}
            alt={album.title}
            style={{ maxWidth: "250px", borderRadius: "8px" }}
          />
        )}
        <div>
          <h1>{album.title}</h1>
          <p><strong>Artist:</strong> {album.artist}</p>
          <p><strong>Year:</strong> {album.year}</p>
          {album.description && <p><strong>Description:</strong> {album.description}</p>}
        </div>
      </div>

      {album.tracks && album.tracks.length > 0 && (
        <div className="mt-4" style={{ maxWidth: "600px" }}>
          <h4>Tracks</h4>
          <ul className="list-group">
            {album.tracks.map((track) => (
              <li key={track.id} className="list-group-item p-0">
                <div className="d-flex align-items-center px-3 py-2">
                  <span className="text-muted me-3" style={{ minWidth: "2rem" }}>
                    {track.number}.
                  </span>
                  <span className="flex-grow-1">{track.title}</span>

                  {feedback?.trackId === track.id ? (
                    <span className={`badge ${feedback!.msg === "Added!" ? "bg-success" : "bg-danger"}`}>
                      {feedback!.msg}
                    </span>
                  ) : session && (
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => toggleOpen(track.id!)}
                      title="Add to playlist"
                    >
                      + Playlist
                    </button>
                  )}
                </div>

                {openTrackId === track.id && (
                  <div className="d-flex gap-2 px-3 pb-2">
                    {myPlaylists.length === 0 ? (
                      <span className="text-muted small">You have no playlists yet.</span>
                    ) : (
                      <>
                        <select
                          className="form-select form-select-sm"
                          value={selectedPlaylistId}
                          onChange={(e) => setSelectedPlaylistId(e.target.value)}
                        >
                          <option value="">Select playlist...</option>
                          {myPlaylists.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.is_public ? "" : "(private)"}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-primary btn-sm text-nowrap"
                          disabled={!selectedPlaylistId}
                          onClick={() => void handleAddToPlaylist(track.id!)}
                        >
                          Add
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
