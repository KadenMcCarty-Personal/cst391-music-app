// A component to display individual album info, not included in Next.js routing
// app/components/AlbumCard.tsx
"use client";

import { useSession } from "next-auth/react";
import { Album } from "@/lib/types";

interface AlbumCardProps {
  album: Album;
  onClick: (album: Album, uri: string) => void;
}

export default function AlbumCard({ album, onClick }: AlbumCardProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="card" style={{ width: "18rem", margin: "1rem" }}>
      {album.image && (
        <img src={album.image} className="card-img-top" alt={album.title} />
      )}
      <div className="card-body">
        <h5 className="card-title">{album.title}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{album.artist}</h6>
        <p className="card-text">{album.year}</p>
        <p className="card-text">{album.description}</p>
        {session && (
          <button
            className="btn btn-secondary me-2"
            onClick={() => onClick(album, "/show/")}
          >
            View
          </button>
        )}
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => onClick(album, "/edit/")}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
