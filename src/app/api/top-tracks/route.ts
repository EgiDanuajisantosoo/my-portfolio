import { NextResponse, NextRequest } from 'next/server';

// ===============================
// Refresh access token (OWNER)
// ===============================
async function getAccessToken() {
  const client_id = process.env.SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN!;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    console.error('[Spotify Token Error]', data);
    throw new Error(data.error_description || 'Failed to refresh token');
  }

  return data.access_token as string;
}

// ===============================
// Endpoint utama
// ===============================
export async function GET(request: NextRequest) {
  if (
    !process.env.SPOTIFY_CLIENT_ID ||
    !process.env.SPOTIFY_CLIENT_SECRET ||
    !process.env.SPOTIFY_REFRESH_TOKEN
  ) {
    return NextResponse.json(
      { error: 'Variabel lingkungan Spotify belum diatur' },
      { status: 500 }
    );
  }

  try {
    // Ambil access token (selalu fresh)
    const accessToken = await getAccessToken();

    // Ambil query parameter (tetap sama)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') ?? 'tracks'; // tracks | artists
    const time_range = searchParams.get('time_range') ?? 'medium_term';
    const limit = searchParams.get('limit') ?? '10';

    // Validasi ringan (aman untuk deploy)
    const limitNum = Math.min(Math.max(Number(limit), 1), 50);

    const apiUrl = new URL(`https://api.spotify.com/v1/me/top/${type}`);
    apiUrl.searchParams.set('time_range', time_range);
    apiUrl.searchParams.set('limit', String(limitNum));

    const response = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

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
    return NextResponse.json(
      {
        error: 'Gagal mengambil data dari Spotify',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
