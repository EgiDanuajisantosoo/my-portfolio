import { NextResponse, NextRequest } from 'next/server';

// Fungsi untuk mendapatkan access token menggunakan refresh token
// (Diambil langsung dari contoh Anda)
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
    // Menambahkan cache: 'no-store' agar setiap request selalu baru
    cache: 'no-store',
  });

  const data = await response.json();
  // Menambahkan penanganan jika refresh token tidak valid
  if (data.error) {
    console.error('Error refreshing token:', data.error_description);
    throw new Error(data.error_description);
  }
  return data.access_token;
}

// Endpoint utama
export async function GET(request: NextRequest) {
  // 1. Ambil kredensial dari environment variables
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!client_id || !client_secret || !refresh_token) {
    return NextResponse.json({ error: 'Variabel lingkungan Spotify belum diatur' }, { status: 500 });
  }

  try {
    // 2. Dapatkan Access Token yang baru setiap kali ada permintaan
    const accessToken = await getAccessToken(client_id, client_secret, refresh_token);

    // 3. Ambil query parameters dari URL (type, time_range, limit)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'tracks'; // 'tracks' atau 'artists'
    const time_range = searchParams.get('time_range') || 'medium_term';
    const limit = searchParams.get('limit') || '10'; // Default limit 10

    // 4. Bangun URL untuk API Top Items Spotify
    const TOP_ITEMS_ENDPOINT = `https://api.spotify.com/v1/me/top/${type}?time_range=${time_range}&limit=${limit}`;

    // 5. Panggil API Spotify untuk mendapatkan data top items
    const response = await fetch(TOP_ITEMS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Jika respons dari Spotify tidak OK, teruskan errornya
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Gagal mengambil data dari Spotify', details: errorData },
        { status: response.status }
      );
    }

    // Jika berhasil, kirimkan data kembali ke klien
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[Spotify API Error]', error);
    return NextResponse.json({ error: 'Gagal mengambil data dari Spotify', details: error.message }, { status: 500 });
  }
}