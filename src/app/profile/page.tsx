// src/app/profile/page.tsx
"use client";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SpotifyCurrentTrack() {
  const { data, error } = useSWR('/api/now-playing', fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <div>Gagal memuat data Spotify...</div>;
  if (!data) return <div>Loading...</div>;

  if (!data.isPlaying) {
    return <div>Tidak ada lagu yang sedang diputar.</div>;
  }

  return (
    <div>
      <div>🎶 Sedang Memutar: {data.name}</div>
      <div>🎤 Artis: {data.artists.join(", ")}</div>
      <div>
        🖼️ Album Art:{" "}
        <img src={data.album.images[0].url} alt={data.name} width={100} />
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <div>
      <h2>Profil Saya</h2>
      <SpotifyCurrentTrack />
    </div>
  );
}