import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/topTracks?error=missing_token', request.url));
  }

  const apiKey = process.env.LASTFM_API_KEY;
  const apiSecret = process.env.LASTFM_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'LASTFM_API_KEY atau LASTFM_API_SECRET belum diatur di .env' }, { status: 500 });
  }

  try {
    const sigString = `api_key${apiKey}methodauth.getSessiontoken${token}${apiSecret}`;
    const signature = crypto.createHash('md5').update(sigString, 'utf8').digest('hex');

    const lastfmUrl = `http://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${apiKey}&token=${token}&api_sig=${signature}&format=json`;
    const res = await fetch(lastfmUrl, { cache: 'no-store' });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: 'Gagal mengambil sesi Last.fm', details: errText }, { status: res.status });
    }

    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ error: data.message, code: data.error }, { status: 400 });
    }

    const sessionName = data.session.name;
    const sessionKey = data.session.key;

    // Alihkan kembali ke halaman Top Spotify setelah sukses
    const response = NextResponse.redirect(new URL('/topTracks', request.url));

    // Simpan data login ke cookies
    const maxAge = 365 * 24 * 60 * 60; // 1 tahun
    response.cookies.set('lastfm_username', sessionName, { httpOnly: false, path: '/', maxAge });
    response.cookies.set('lastfm_session_key', sessionKey, { httpOnly: true, path: '/', maxAge });

    return response;
  } catch (error: any) {
    console.error('[Last.fm Callback Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
