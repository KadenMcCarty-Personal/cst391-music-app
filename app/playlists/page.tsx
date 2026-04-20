"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/components/NavBar";
import { get, post } from "@/lib/apiClient";
import { Playlist } from "@/lib/types";

export default function PlaylistsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPublic, setNewPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadPlaylists = async () => {
    try {
      const data = await get<Playlist[]>("/playlists");
      setPlaylists(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    void loadPlaylists();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await post("/playlists", { name: newName.trim(), is_public: newPublic });
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

        {playlists.length === 0 && !error && (
          <p className="text-muted">No public playlists yet.</p>
        )}

        <div className="row">
          {playlists.map((playlist) => (
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
