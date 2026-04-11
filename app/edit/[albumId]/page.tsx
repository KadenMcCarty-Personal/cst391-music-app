// app/edit/[albumId]/page.tsx
"use client";

import { get, post, put } from "@/lib/apiClient";
import { Album, Track } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditAlbumPage() {
  const router = useRouter();
  // Next.js params hook replaces useParams from react-router
  const params = useParams();
  const albumId = params?.albumId; // undefined under /new

  const defaultAlbum: Album = {
    id: 0,
    title: "",
    artist: "",
    description: "",
    year: 0,
    image: "",
    tracks: [] as Track[],
  };

  // Type safe use of defaultAlbum to initialize state
  const [album, setAlbum] = useState(defaultAlbum);

  // Load album only when editing
  useEffect(() => {
    if (!albumId) return; // creation mode
    (async () => {
      const res = await get<Album>(`/albums?albumId=${albumId}`);
      if (Array.isArray(res)) {
        setAlbum(res[0]);
      } else {
        setAlbum(res);
      }
    })();
  }, [albumId]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const payload = {
      ...album,
      year: parseInt(String(album.year), 10),
    };
    if (albumId) {
      await put<Album>("/albums", { ...payload, albumId: parseInt(String(albumId), 10) });
    } else {
      await post<Album>("/albums", payload);
    }
    router.push("/");
  };

  const onChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setAlbum((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <main style={{ padding: "1rem" }}>
      <h1>{albumId ? "Edit Album" : "Create Album"}</h1>
      <form onSubmit={handleSubmit}>
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
    </main>
  );
}
