// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
// import SearchAlbum from "../components/SearchAlbum";
// import EditAlbum from "../components/EditAlbum";
// import OneAlbum from "../components/OneAlbum";
import { useRouter } from "next/navigation";
import { Album } from "@/lib/types";
import { get } from "@/lib/apiClient";
import AlbumList from "./components/AlbumList";

export default function Page() {
  const [searchPhrase, setSearchPhrase] = useState("");
  const [albumList, setAlbumList] = useState<Album[]>([]);
  const [currentlySelectedAlbumId, setCurrentlySelectedAlbumId] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const loadAlbums = async () => {
    try {
      const data = await get<Album[]>("/albums");
      console.log("Fetched albums:", data);
      setAlbumList(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAlbums();
  }, []);

  const updateSearchResults = async (phrase: string) => {
    console.log("phrase is " + phrase);
    setSearchPhrase(phrase);
  };

  const updateSingleAlbum = (albumId: number, uri: string) => {
    console.log("Update Single Album = ", albumId);
    const indexNumber = albumList.findIndex((a) => a.id === albumId);
    setCurrentlySelectedAlbumId(indexNumber);
    const path = `${uri}${indexNumber}`;
    console.log("path", path);
    router.push(path);
  };

  const lowerPhrase = searchPhrase.toLowerCase();
  const renderedList = albumList.filter((album) =>
    searchPhrase === "" ||
    album.title.toLowerCase().includes(lowerPhrase) ||
    album.artist.toLowerCase().includes(lowerPhrase) ||
    (album.description ?? "").toLowerCase().includes(lowerPhrase)
  );

  const onEditAlbum = () => {
    void loadAlbums();
    router.push("/");
  };

  console.log("currentlySelectedAlbumId", currentlySelectedAlbumId);
  console.log("updateSingleAlbum", updateSingleAlbum);
  console.log("onEditAlbum", onEditAlbum);
  console.log("renderedList", renderedList);
  console.log("updateSearchResults", updateSearchResults);

  return (
    <main>
      <NavBar />
      <h1>Kaden McCarty - Album List</h1>
      <p>This JSON data is rendered directly from the API response.</p>
      {error ? (
        <div style={{
          backgroundColor: "#fee2e2",
          border: "1px solid #ef4444",
          padding: "1rem",
          borderRadius: "8px",
          color: "#b91c1c",
        }}>
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <>
          <input
            className="form-control mb-3"
            placeholder="Search albums..."
            value={searchPhrase}
            onChange={(e) => void updateSearchResults(e.target.value)}
          />
          {albumList.length === 0 && <p>Loading albums...</p>}
          <AlbumList
            albums={renderedList}
            onAlbumSelected={(album, uri) => updateSingleAlbum(album.id, uri)}
          />
        </>
      )}
    </main>
  );
}
