// src/app/api/spotify-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const code = body.code;

  if (!code) {
    return NextResponse.json({ error: 'Code not provided' }, { status: 400 });
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI!;

  const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirect_uri);

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return new NextResponse(`Spotify Token Error: ${errorBody}`, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return new NextResponse(`Internal Error: ${err.message}`, { status: 500 });
  }
}
