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

export async function GET(req: Request) {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const url = new URL(req.url);
  const refresh_token = url.searchParams.get('refresh_token') ?? process.env.SPOTIFY_REFRESH_TOKEN;

  if (!client_id || !client_secret || !refresh_token) {
    return NextResponse.json({ error: 'Missing Spotify credentials or refresh token' }, { status: 400 });
  }

  try {
    const access_token = await getAccessToken(client_id, client_secret, refresh_token);
    return NextResponse.json({ access_token });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
  }
}