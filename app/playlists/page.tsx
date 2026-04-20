"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/components/NavBar";
import { get, post } from "@/lib/apiClient";
import { Playlist } from "@/lib/types";

type Tab = "all" | "my playlists";

export default function PlaylistsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const githubId = session?.user?.githubId;
  const router = useRouter();

  const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPublic, setNewPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadPlaylists = async () => {
    try {
      // Admin fetches all (including private), others fetch public only
      const allEndpoint = isAdmin ? "/admin/playlists" : "/playlists";
      const allData = await get<Playlist[]>(allEndpoint);
      setAllPlaylists(allData);

      // "my playlists" fetches user's playlists then filters to only ones they own
      if (githubId) {
        const myData = await get<Playlist[]>(`/playlists?user_id=${githubId}`);
        setMyPlaylists(myData.filter((p) => p.user_id === githubId));
      }

      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    void loadPlaylists();
  // re-fetch once session resolves
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, githubId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await post("/playlists", {
        name: newName.trim(),
        is_public: newPublic,
        user_id: githubId ?? null,
      });
      setNewName("");
      setNewPublic(true);
      setShowForm(false);
      await loadPlaylists();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const displayed = tab === "my playlists" ? myPlaylists : allPlaylists;

  return (
    <main>
      <NavBar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>Playlists</h1>
          {session && (
            <button
              className="btn btn-success"
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "Cancel" : "+ New Playlist"}
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={(e) => void handleCreate(e)} className="card p-3 mb-4">
            <h5>Create Playlist</h5>
            <div className="mb-2">
              <input
                className="form-control"
                placeholder="Playlist name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="isPublic"
                checked={newPublic}
                onChange={(e) => setNewPublic(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isPublic">
                Public
              </label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        )}

        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${tab === "all" ? "active" : ""}`}
              onClick={() => setTab("all")}
            >
              {isAdmin ? "All Playlists" : "All Public"}
            </button>
          </li>
          {session && (
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "my playlists" ? "active" : ""}`}
                onClick={() => setTab("my playlists")}
              >
                My Playlists
              </button>
            </li>
          )}
        </ul>

        {displayed.length === 0 && !error && (
          <p className="text-muted">
            {tab === "my playlists" ? "You have no playlists yet." : "No playlists found."}
          </p>
        )}

        <div className="row">
          {displayed.map((playlist) => (
            <div key={playlist.id} className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{playlist.name}</h5>
                  <span
                    className={`badge mb-3 ${playlist.is_public ? "bg-success" : "bg-secondary"}`}
                    style={{ width: "fit-content" }}
                  >
                    {playlist.is_public ? "Public" : "Private"}
                  </span>
                  <button
                    className="btn btn-outline-primary mt-auto"
                    onClick={() => router.push(`/playlists/${playlist.id}`)}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
