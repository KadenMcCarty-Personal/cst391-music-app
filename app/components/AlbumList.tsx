// app/components/AlbumList.tsx
import { Album } from "@/lib/types";
import AlbumCard from "./AlbumCard";

interface AlbumListProps {
  albums: Album[];
  onAlbumSelected: (album: Album, uri: string) => void;
}

export default function AlbumList({ albums, onAlbumSelected }: AlbumListProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          onClick={onAlbumSelected}
        />
      ))}
    </div>
  );
}
