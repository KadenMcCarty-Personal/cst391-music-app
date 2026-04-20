// app/edit/[albumId]/page.tsx
"use client";

import { get, post, put } from "@/lib/apiClient";
import { Album, Track } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NavBar from "@/app/components/NavBar";

export default function EditAlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params?.albumId;

  const defaultAlbum: Album = {
    id: 0,
    title: "",
    artist: "",
    description: "",
    year: 0,
    image: "",
    tracks: [] as Track[],
  };

  const [album, setAlbum] = useState(defaultAlbum);
  const [newTrackTitle, setNewTrackTitle] = useState("");
  const [addingTrack, setAddingTrack] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  const loadAlbum = async () => {
    if (!albumId) return;
    const res = await get<Album>(`/albums?albumId=${albumId}`);
    setAlbum(Array.isArray(res) ? res[0] : res);
  };

  useEffect(() => {
    void loadAlbum();
  }, [albumId]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const payload = { ...album, year: parseInt(String(album.year), 10) };
    if (albumId) {
      await put<Album>("/albums", { ...payload, albumId: parseInt(String(albumId), 10) });
    } else {
      await post<Album>("/albums", payload);
    }
    router.push("/");
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim() || !albumId) return;
    setAddingTrack(true);
    setTrackError(null);
    try {
      await post(`/albums/${albumId}/tracks`, { title: newTrackTitle.trim() });
      setNewTrackTitle("");
      await loadAlbum();
    } catch (err) {
      setTrackError((err as Error).message);
    } finally {
      setAddingTrack(false);
    }
  };

  const onChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setAlbum((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <main style={{ padding: "1rem" }}>
      <NavBar />
      <h1>{albumId ? "Edit Album" : "Create Album"}</h1>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="mb-3">
          <input
            className="form-control"
            placeholder="Title"
            value={album.title}
            onChange={onChange("title")}
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            placeholder="Artist"
            value={album.artist}
            onChange={onChange("artist")}
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            placeholder="Year"
            value={album.year}
            onChange={onChange("year")}
          />
        </div>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="Description"
            value={album.description ?? ""}
            onChange={onChange("description")}
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            placeholder="Image URL"
            value={album.image ?? ""}
            onChange={onChange("image")}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {albumId ? "Update" : "Save"}
        </button>
      </form>

      {albumId && (
        <div className="mt-4" style={{ maxWidth: "600px" }}>
          <h4>Tracks</h4>

          {(!album.tracks || album.tracks.length === 0) && (
            <p className="text-muted">No tracks yet.</p>
          )}

          <ul className="list-group mb-3">
            {album.tracks?.map((track) => (
              <li key={track.id} className="list-group-item d-flex align-items-center gap-3">
                <span className="text-muted" style={{ minWidth: "2rem" }}>
                  {track.number}.
                </span>
                <span>{track.title}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={(e) => void handleAddTrack(e)} className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="New track title"
              value={newTrackTitle}
              onChange={(e) => setNewTrackTitle(e.target.value)}
              required
            />
            <button className="btn btn-success text-nowrap" type="submit" disabled={addingTrack}>
              {addingTrack ? "Adding..." : "+ Add Track"}
            </button>
          </form>
          {trackError && <div className="text-danger mt-1">{trackError}</div>}
        </div>
      )}
    </main>
  );
}
