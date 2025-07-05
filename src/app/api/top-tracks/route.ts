import { NextResponse, NextRequest } from 'next/server';

// Fungsi untuk mendapatkan access token menggunakan refresh token
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
    cache: 'no-store',
  });

  const data = await response.json();
  if (data.error) {
    console.error('Error refreshing token:', data.error_description);
    throw new Error(data.error_description);
  }
  return data.access_token;
}

// Endpoint utama
export async function GET(request: NextRequest) {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!client_id || !client_secret || !refresh_token) {
    return NextResponse.json({ error: 'Variabel lingkungan Spotify belum diatur' }, { status: 500 });
  }

  try {
    const accessToken = await getAccessToken(client_id, client_secret, refresh_token);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'tracks'; // 'tracks' atau 'artists'
    const time_range = searchParams.get('time_range') || 'medium_term';
    const limit = searchParams.get('limit') || '10';

    // URL Spotify API yang benar untuk top tracks/artists
    const api_url = new URL(`https://api.spotify.com/v1/me/top/${type}`);
    api_url.searchParams.append('time_range', time_range);
    api_url.searchParams.append('limit', limit);

    const response = await fetch(api_url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    // if( limit === '0' ) {
    //   return NextResponse.json({ error: 'Limit tidak boleh 0' }, { status: 400 });
    // }else if(limit > '50') {
    //   return NextResponse.json({ error: 'Limit tidak boleh lebih dari 50' }, { status: 400 });
    // }

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Tidak ada data', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[Spotify API Error]', error);
    return NextResponse.json({ error: 'Gagal mengambil data dari Spotify', details: error.message }, { status: 500 });
  }
}
