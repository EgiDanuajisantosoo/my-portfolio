// File: src/app/lib/types.ts

// Tipe dasar untuk objek gambar Spotify
export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

// Tipe untuk respons dari endpoint profil pengguna
export interface UserProfileResponse {
  country: string;
  display_name: string;
  email: string;
  id: string;
  images: SpotifyImage[];
}

// Tipe untuk satu item artis
export interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
}

// Tipe untuk satu item trek
export interface Track {
  is_playable: boolean;
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    name: string;
    images: SpotifyImage[];
  };
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
}

// Tipe untuk respons dari endpoint top tracks
export interface TopTracksResponse {
  items: Track[];
}

// Tipe untuk respons dari endpoint top artists
export interface TopArtistsResponse {
  items: Artist[];
}

// Tipe untuk satu item audio features
export interface AudioFeature {
  id: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
}

// Tipe untuk respons dari endpoint audio features
export interface AudioFeaturesResponse {
  audio_features: AudioFeature[];
}

// Tipe untuk hasil analisis audio features rata-rata
export interface AverageAudioFeatures {
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
}
