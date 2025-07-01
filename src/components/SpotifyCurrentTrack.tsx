// src/components/SpotifyCurrentTrack.tsx (atau di mana pun file Anda berada)
"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SpotifyCurrentTrack() {
  // Gunakan SWR untuk mengambil data secara otomatis dan periodik
  const { data, error } = useSWR('/api/now-playing', fetcher, {
    refreshInterval: 5000, // refresh setiap 5 detik
  });

  if (error) return <div>Gagal memuat...</div>;
  if (!data) return <div>Loading...</div>;

  if (!data.isPlaying) {
    return <div>Tidak ada lagu yang sedang diputar saat ini.</div>;
  }

  return (
    <div>
      <div>🎶 Sedang Memutar: {data.name}</div>
      <div>🎤 Artis: {data.artists.join(", ")}</div>
      <div>
        🖼️ Album Art:{" "}
        <img src={data.album.images[0].url} alt="Album Art" width={100} />
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <div>
      asdasda
      <SpotifyCurrentTrack />
    </div>
  );
}