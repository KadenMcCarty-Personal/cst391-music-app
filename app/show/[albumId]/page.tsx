// app/show/[albumId]/page.tsx
"use client";

import { get } from "@/lib/apiClient";
import { Album } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ShowAlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params?.albumId;

  const [album, setAlbum] = useState<Album | null>(null);

  useEffect(() => {
    if (!albumId) return;
    (async () => {
      const res = await get<Album>(`/albums?albumId=${albumId}`);
      if (Array.isArray(res)) {
        setAlbum(res[0]);
      } else {
        setAlbum(res);
      }
    })();
  }, [albumId]);

  if (!album) return <p style={{ padding: "1rem" }}>Loading...</p>;

  return (
    <main style={{ padding: "1rem" }}>
      <h1>{album.title}</h1>
      {album.image && (
        <img
          src={album.image}
          alt={album.title}
          style={{ maxWidth: "300px", marginBottom: "1rem" }}
        />
      )}
      <p><strong>Artist:</strong> {album.artist}</p>
      <p><strong>Year:</strong> {album.year}</p>
      {album.description && <p><strong>Description:</strong> {album.description}</p>}
      <button className="btn btn-primary" onClick={() => router.push("/")}>
        Home
      </button>
    </main>
  );
}
