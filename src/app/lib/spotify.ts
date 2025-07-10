import { Buffer } from 'buffer';

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

// Ambil kredensial dari environment variables
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

// Buat Basic Auth header
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

/**
 * Menggunakan refresh token untuk mendapatkan access token baru dari Spotify.
 */
export const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token || '',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Failed to refresh access token: ${JSON.stringify(errorBody)}`);
  }

  const data = await response.json();
  return data.access_token as string;
};