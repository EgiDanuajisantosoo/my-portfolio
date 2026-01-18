// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const REDIRECT_URI = process.env.REDIRECT_URI ?? 'http://127.0.0.1:3000/api/callback';

function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) result += chars[bytes[i] % chars.length];
    return result;
}

export async function GET(_: Request) {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    if (!client_id) return new NextResponse('Missing CLIENT_ID env var', { status: 500 });

    const state = generateRandomString(16);

    const scope = [
        'user-read-recently-played',
        'user-top-read',
        'user-read-private',
        'user-read-email',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private',
        'user-library-read',
        'user-library-modify',
        'user-top-read',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'streaming',
        'app-remote-control',
        'user-follow-read',
        'user-follow-modify',
        'ugc-image-upload'
    ].join(' ');

    const params = new URLSearchParams({
        response_type: 'code',
        client_id,
        scope,
        redirect_uri: REDIRECT_URI,
        state
    });

    const res = NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
    res.cookies.set('spotify_auth_state', state, {
        httpOnly: true,
        path: '/',
        maxAge: 3600,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
    return res;
}
