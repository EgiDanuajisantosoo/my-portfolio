// src/app/api/now-playing/route.ts
import { NextResponse } from 'next/server';
import { it } from 'node:test';

async function getAccessToken(client_id: string, client_secret: string, refresh_token: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export async function GET() {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!client_id || !client_secret || !refresh_token) {
    return NextResponse.json({ error: 'Environment variables not configured' }, { status: 500 });
  }

  try {
    const accessToken = await getAccessToken(client_id, client_secret, refresh_token);

    // 🔊 Coba ambil lagu yang sedang diputar
    const nowPlayingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (nowPlayingRes.status === 200) {
      const song = await nowPlayingRes.json();
      if (song && song.item) {
        return NextResponse.json({
          isPlaying: true,
          name: song.item.name,
          artists: song.item.artists.map((artist: any) => artist.name),
          album: { images: song.item.album.images },
          progress_ms: song.progress_ms,
          duration_ms: song.item.duration_ms,
          played_at: song.timestamp,
          external_urls: song.item.external_urls,
          songUrl: song.item.external_urls.spotify,
        });
      }
    }

    // ❗ Tidak ada lagu aktif → Ambil terakhir diputar
    // Coba ambil status player (bisa playing, paused, atau tidak ada track)
    const playerRes = await fetch('https://api.spotify.com/v1/me/player', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (playerRes.ok) {
      const player = await playerRes.json();
      if (player && player.item) {
        return NextResponse.json({
          isPlaying: player.is_playing,
          name: player.item.name,
          artists: player.item.artists.map((artist: any) => artist.name),
          album: { images: player.item.album.images },
          progress_ms: player.progress_ms,
          duration_ms: player.item.duration_ms,
          played_at: player.timestamp,
          external_urls: player.item.external_urls,
          songUrl: player.item.external_urls.spotify,
        });
      }
    }

    return NextResponse.json({ isPlaying: false });
  } catch (error) {
    console.error('[Spotify API Error]', error);
    return NextResponse.json({ error: 'Failed to fetch data from Spotify' }, { status: 500 });
  }
}

