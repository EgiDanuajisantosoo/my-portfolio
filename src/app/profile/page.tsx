"use client";
import React, { useEffect, useState } from "react";

type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
};

const accessToken = "PASTE_YOUR_ACCESS_TOKEN_HERE"; // Ganti dengan token Anda

function SpotifyCurrentTrack() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrentTrack() {
      setLoading(true);
      const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 200) {
        const data = await res.json();
        setTrack(data.item);
      } else {
        setTrack(null);
      }
      setLoading(false);
    }

    fetchCurrentTrack();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!track) return <div>Tidak ada lagu yang sedang diputar saat ini.</div>;

  return (
    <div>
      <div>🎶 Sedang Memutar: {track.name}</div>
      <div>🎤 Artis: {track.artists.map((a) => a.name).join(", ")}</div>
      <div>
        🖼️ Album Art:{" "}
        <img src={track.album.images[0].url} alt="Album Art" width={100} />
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


