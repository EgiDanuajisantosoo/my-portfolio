"use client";
import React, { useEffect, useState } from "react";

type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
};

function SpotifyCurrentTrack() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokenAndTrack() {
      setLoading(true);
      setError(null);

      try {
        // Fetch the access token from your API
        const tokenRes = await fetch("/api/spotify-token");
        if (!tokenRes.ok) {
          throw new Error("Gagal mendapatkan token Spotify");
        }
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // Fetch the current track from Spotify
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
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
        setTrack(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTokenAndTrack();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
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
