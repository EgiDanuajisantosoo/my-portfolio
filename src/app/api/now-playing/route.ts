import { NextResponse } from 'next/server';

async function getAccessToken(client_id: string, client_secret: string, refresh_token: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
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
    const nowPlayingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (nowPlayingRes.status === 204 || nowPlayingRes.status > 400 || !nowPlayingRes.ok) {
      return NextResponse.json({ isPlaying: false });
    }

    const song = await nowPlayingRes.json();
    if (!song || !song.item) {
      return NextResponse.json({ isPlaying: false });
    }

    const trackData = {
      isPlaying: song.is_playing,
      name: song.item.name,
      artists: song.item.artists.map((artist: any) => artist.name),
      album: {
        images: song.item.album.images,
      },
    };
    return NextResponse.json(trackData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data from Spotify' }, { status: 500 });
  }
}