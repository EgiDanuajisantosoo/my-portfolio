// src/app/api/now-playing/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  const cookieStore = await cookies();
  let accessToken = cookieStore.get('spotify_access_token')?.value;
  const refreshToken = cookieStore.get('spotify_refresh_token')?.value;

  if (!client_id || !client_secret) {
    return NextResponse.json({ error: 'Environment variables not configured' }, { status: 500 });
  }

  // If no access token from cookie, try environment (fallback)
  if (!accessToken) {
    accessToken = process.env.SPOTIFY_ACCESS_TOKEN ?? undefined;
  }

  // If still no access token but we have a refresh token cookie, refresh it
  if (!accessToken && refreshToken) {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      },
      body: body.toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return NextResponse.json({ error: 'Failed to refresh token', details: err }, { status: tokenRes.status });
    }

    const data = await tokenRes.json();
    accessToken = data.access_token;

    const accessMaxAge = typeof data.expires_in === 'number' ? data.expires_in : 3600;
    const accessCookieOptions = { httpOnly: true, path: '/', maxAge: accessMaxAge };
    const refreshCookieOptions = { httpOnly: true, path: '/', maxAge: 30 * 24 * 3600 };

    const attachCookies = (res: NextResponse) => {
      if (accessToken) {
        res.cookies.set('spotify_access_token', accessToken, accessCookieOptions);
      }
      if (data.refresh_token) {
        res.cookies.set('spotify_refresh_token', data.refresh_token, refreshCookieOptions);
      }
      return res;
    };

    // continue using the refreshed token for the rest of the handler by returning the rest of the logic within this branch
    // fetch currently-playing using refreshed token
    try {
      const nowPlayingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (nowPlayingRes.status === 200) {
        const song = await nowPlayingRes.json();
        if (song && song.item) {
          const res = NextResponse.json({
            isPlaying: true,
            name: song.item.name,
            artists: song.item.artists.map((artist: any) => artist.name),
            album: { images: song.item.album.images },
            progress_ms: song.progress_ms,
            duration_ms: song.item.duration_ms,
            played_at: song.timestamp,
            external_urls: song.item.external_urls,
            songUrl: song.item.external_urls.spotify,
          }, { status: 200 });
          return attachCookies(res);
        }
      }

      const recentlyPlayedRes = await fetch(
        'https://api.spotify.com/v1/me/player/recently-played?limit=1',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (recentlyPlayedRes.ok) {
        const data2 = await recentlyPlayedRes.json();
        const item = data2.items?.[0];
        if (item) {
          const res = NextResponse.json({
            isPlaying: false,
            name: item.track.name,
            artists: item.track.artists.map((artist: any) => artist.name),
            album: { images: item.track.album.images },
            played_at: item.played_at,
            duration_ms: item.track.duration_ms,
            progress_ms: item.progress_ms,
            external_urls: item.track.external_urls,
            songUrl: item.track.external_urls.spotify,
          }, { status: 200 });
          return attachCookies(res);
        }
      }

      const res = NextResponse.json({ isPlaying: false }, { status: 200 });
      return attachCookies(res);
    } catch (error) {
      console.error('[Spotify API Error]', error);
      return NextResponse.json({ error: 'Failed to fetch data from Spotify' }, { status: 500 });
    }
  }

  // If we have an access token (from cookie or env), use it
  if (!accessToken) {
    return NextResponse.json({ error: 'No access token available' }, { status: 401 });
  }

  try {
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

    const recentlyPlayedRes = await fetch(
      'https://api.spotify.com/v1/me/player/recently-played?limit=1',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (recentlyPlayedRes.ok) {
      const data = await recentlyPlayedRes.json();
      const item = data.items?.[0];
      if (item) {
        return NextResponse.json({
          isPlaying: false,
          name: item.track.name,
          artists: item.track.artists.map((artist: any) => artist.name),
          album: { images: item.track.album.images },
          played_at: item.played_at,
          duration_ms: item.track.duration_ms,
          progress_ms: item.progress_ms,
          external_urls: item.track.external_urls,
          songUrl: item.track.external_urls.spotify,
        });
      }
    }

    return NextResponse.json({ isPlaying: false });
  } catch (error) {
    console.error('[Spotify API Error]', error);
    return NextResponse.json({ error: 'Failed to fetch data from Spotify' }, { status: 500 });
  }
}
