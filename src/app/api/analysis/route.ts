// File: src/app/api/analysis/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAccessToken } from '@/app/lib/spotify';
import { analyzeGenres, analyzeAudioFeatures } from '@/app/lib/spotify-analysis';
import {
  TopTracksResponse,
  TopArtistsResponse,
  AudioFeaturesResponse,
  UserProfileResponse,
} from '@/app/lib/types';

const USER_PROFILE_ENDPOINT = 'https://api.spotify.com/v1/me';
const TOP_TRACKS_ENDPOINT = 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50';
const TOP_ARTISTS_ENDPOINT = 'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50';
const AUDIO_FEATURES_ENDPOINT = 'https://api.spotify.com/v1/audio-features';

async function checkSpotifyResponse<T>(response: Response, action: string): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      error: 'Gagal mem-parsing error dari Spotify',
    }));
    console.error(`[Spotify Error] Aksi: ${action}`, {
      status: response.status,
      body: errorBody,
    });
    throw new Error(`Error Spotify API saat ${action}: ${JSON.stringify(errorBody)}`);
  }
  return response.json() as T;
}

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();

    const userProfileRes = await fetch(USER_PROFILE_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userProfile = await checkSpotifyResponse<UserProfileResponse>(userProfileRes, 'mengambil profil pengguna');
    const market = userProfile.country;

    const [topTracksRes, topArtistsRes] = await Promise.all([
      fetch(`${TOP_TRACKS_ENDPOINT}&market=${market}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(TOP_ARTISTS_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const topTracks = await checkSpotifyResponse<TopTracksResponse>(topTracksRes, 'mengambil top tracks');
    const topArtists = await checkSpotifyResponse<TopArtistsResponse>(topArtistsRes, 'mengambil top artists');

    const favoriteGenres = analyzeGenres(topArtists);

    // --- PERBAIKAN KUNCI DI SINI ---
    // Saring lagu untuk hanya menyertakan yang dapat diputar.
    // Ini adalah pertahanan terbaik melawan error 403 yang disebabkan oleh lisensi.
    const playableTracks = topTracks.items.filter(
      (track) => track.is_playable !== false
    );
    
    // Gunakan ID dari lagu yang sudah disaring.
    const trackIds = playableTracks.map((t) => t.id).filter(Boolean);
    // --- AKHIR PERBAIKAN ---

    let averageAudioFeatures = { energy: 0, danceability: 0, valence: 0, acousticness: 0 };

    if (trackIds.length > 0) {
      const audioRes = await fetch(`${AUDIO_FEATURES_ENDPOINT}?ids=${trackIds.join(',')}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const audioFeaturesData = await checkSpotifyResponse<AudioFeaturesResponse>(audioRes, 'mengambil audio features');
      averageAudioFeatures = analyzeAudioFeatures(audioFeaturesData);
    } else {
      console.log("Tidak ada lagu yang dapat diputar ditemukan untuk dianalisis.");
    }

    return NextResponse.json({
      topTracks: topTracks.items, // Anda bisa memilih untuk mengembalikan semua lagu atau hanya yang dapat diputar
      favoriteGenres,
      averageAudioFeatures,
    });
  } catch (error) {
    console.error('[ANALYSIS_API_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
