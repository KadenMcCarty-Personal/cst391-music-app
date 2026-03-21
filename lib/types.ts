export interface Track {
  id?: number;
  number: number;
  title: string;
  lyrics?: string | null;
  video?: string | null;
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  year: number;
  image?: string | null;
  description?: string | null;
  tracks?: Track[];
}

export interface PlaylistTrack {
  id: number;
  track_id: number;
  playlist_id: number;
  position: number;
  title: string;
  number: number;
  lyrics?: string | null;
  video_url?: string | null;
  album_id: number;
}

export interface Playlist {
  id: number;
  name: string;
  user_id?: number | null;
  is_public: boolean;
  tracks?: PlaylistTrack[];
}
