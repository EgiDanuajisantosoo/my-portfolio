import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/topTracks', request.url));
  
  response.cookies.delete('lastfm_username');
  response.cookies.delete('lastfm_session_key');

  return response;
}
