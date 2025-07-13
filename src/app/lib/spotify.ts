// Tambahkan deklarasi ini di awal file jika tidak menggunakan @types/node
declare const process: {
  env: {
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
    SPOTIFY_REFRESH_TOKEN: string;
  };
};

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

/**
 * Retrieves a Spotify access token using the refresh token flow.
 * Ensures that the request is not cached.
 */
export const getAccessToken = async () => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!client_id || !client_secret || !refresh_token) {
    console.error("Missing Spotify credentials in environment variables.");
    throw new Error("Server configuration error: Missing Spotify credentials.");
  }

  // Encode client_id and client_secret without importing Buffer
  const basic = (globalThis as any).Buffer
    .from(`${client_id}:${client_secret}`)
    .toString('base64');

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      error: 'Failed to parse error from Spotify token endpoint',
    }));
    throw new Error(
      `Failed to get access token from Spotify: ${response.statusText} - ${JSON.stringify(errorBody)}`
    );
  }

  const tokenData = await response.json();
  if (!tokenData.access_token) {
    throw new Error("Invalid access token received from Spotify.");
  }

  return tokenData.access_token;
};
