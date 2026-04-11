// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
// import SearchAlbum from "../components/SearchAlbum";
// import EditAlbum from "../components/EditAlbum";
// import OneAlbum from "../components/OneAlbum";
import { useRouter } from "next/navigation";
import { Album } from "@/lib/types";

export default function Page() {
  const [searchPhrase, setSearchPhrase] = useState("");
  const [albumList, setAlbumList] = useState<Album[]>([]);
  const [currentlySelectedAlbumId, setCurrentlySelectedAlbumId] = useState(0);

  const router = useRouter();

  const loadAlbums = async () => {
    const response = await fetch("/api/albums");
    const data = await response.json();
    console.log("Fetched albums:", data);
    setAlbumList(data);
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

  const renderedList = albumList.filter((album) => {
    if (
      (album.description ?? "").toLowerCase().includes(searchPhrase.toLowerCase()) ||
      searchPhrase === ""
    ) {
      return true;
    }
    return false;
  });

  const onEditAlbum = () => {
    loadAlbums();
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
      <pre
        style={{
          backgroundColor: "#f4f4f4",
          padding: "1rem",
          borderRadius: "8px",
          overflow: "auto",
          color: "#111",
          fontSize: "0.9rem",
          lineHeight: "1.4",
        }}
      >
        {albumList.length > 0 && JSON.stringify(albumList, null, 2)}
      </pre>
      {albumList.length === 0 && <p>Loading albums...</p>}
    </main>
  );
}
