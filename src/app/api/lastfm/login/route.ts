import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'LASTFM_API_KEY belum diatur di variabel lingkungan (.env)' }, { status: 500 });
  }

  const url = new URL(request.url);
  const cbUrl = `${url.origin}/api/lastfm/callback`;

  const lastfmAuthUrl = `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${encodeURIComponent(cbUrl)}`;
  return NextResponse.redirect(lastfmAuthUrl);
}
