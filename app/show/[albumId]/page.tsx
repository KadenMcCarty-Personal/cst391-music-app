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
        <div className="mt-4">
          <h4>Tracks</h4>
          <ul className="list-group" style={{ maxWidth: "600px" }}>
            {album.tracks.map((track) => (
              <li key={track.id} className="list-group-item d-flex align-items-center gap-3">
                <span className="text-muted" style={{ minWidth: "2rem" }}>
                  {track.number}.
                </span>
                <span>{track.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
