// src/app/api/callback/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const REDIRECT_URI = process.env.REDIRECT_URI ?? 'http://127.0.0.1:3000/api/callback';
export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const cookieStore = await cookies();
    const storedState = cookieStore.get('spotify_auth_state')?.value;

    if (!state || state !== storedState) {
        return NextResponse.redirect(new URL('/?error=state_mismatch', url));
    }

    // clear state cookie
    const redirectResponse = NextResponse.redirect(new URL('/', url));
    redirectResponse.cookies.delete({ name: 'spotify_auth_state', path: '/' });

    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!client_id || !client_secret) return new NextResponse('Missing client id/secret', { status: 500 });

    const redirect_uri_full = REDIRECT_URI.startsWith('http') ? REDIRECT_URI : `${url.origin}${REDIRECT_URI}`;

    const body = new URLSearchParams({
        code: code ?? '',
        redirect_uri: redirect_uri_full,
        grant_type: 'authorization_code'
    });

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
        },
        body: body.toString()
    });

    if (!tokenRes.ok) {
        const err = await tokenRes.text();
        return new NextResponse(err, { status: tokenRes.status });
    }

    const data = await tokenRes.json();

    const accessMaxAge = typeof data.expires_in === 'number' ? data.expires_in : 3600;
    redirectResponse.cookies.set('spotify_access_token', data.access_token, { httpOnly: true, path: '/', maxAge: accessMaxAge });
    if (data.refresh_token) {
        redirectResponse.cookies.set('spotify_refresh_token', data.refresh_token, { httpOnly: true, path: '/', maxAge: 30 * 24 * 3600 });
    }

    console.log('Spotify Token Response:', data);

    return redirectResponse;
}