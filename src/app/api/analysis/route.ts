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
  AudioFeature,
} from '@/app/lib/types';

const USER_PROFILE_ENDPOINT = 'https://api.spotify.com/v1/me';
const TOP_TRACKS_ENDPOINT = 'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50';
const TOP_ARTISTS_ENDPOINT = 'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50';
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

    const [topTracksRes, topArtistsRes] = await Promise.all([
      fetch(TOP_TRACKS_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }),
      fetch(TOP_ARTISTS_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }),
    ]);

    const topTracks = await checkSpotifyResponse<TopTracksResponse>(topTracksRes, 'mengambil top tracks');
    const topArtists = await checkSpotifyResponse<TopArtistsResponse>(topArtistsRes, 'mengambil top artists');

    const favoriteGenres = analyzeGenres(topArtists);

    const playableMusicTracks = topTracks.items.filter(
      (track) => track && track.id && track.is_playable !== false && track.type === 'track'
    );
    
    const trackIds = playableMusicTracks.map((t) => t.id);

    // --- Mengembalikan ke Logika Batching yang Efisien ---
    let allAudioFeatures: AudioFeature[] = [];
    const batchSize = 50; // Bisa menggunakan batch yang lebih besar sekarang

    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);
      
      try {
        const audioRes = await fetch(`${AUDIO_FEATURES_ENDPOINT}?ids=${batch.join(',')}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (audioRes.ok) {
          const audioFeaturesData = await audioRes.json() as AudioFeaturesResponse;
          if (audioFeaturesData.audio_features) {
            allAudioFeatures = allAudioFeatures.concat(audioFeaturesData.audio_features.filter(Boolean));
          }
        } else {
          const errorBody = await audioRes.json().catch(() => ({}));
          console.warn(`[ANALYSIS_BATCH_WARN] Gagal memproses batch. Status: ${audioRes.status}`, errorBody);
        }
      } catch (batchError) {
        console.warn(`[ANALYSIS_BATCH_ERROR] Terjadi error pada batch.`, batchError);
      }
    }
    // --- AKHIR LOGIKA BATCHING ---

    let averageAudioFeatures = { energy: 0, danceability: 0, valence: 0, acousticness: 0 };
    
    if (allAudioFeatures.length > 0) {
      averageAudioFeatures = analyzeAudioFeatures({ audio_features: allAudioFeatures });
    } else {
      console.log("Tidak ada fitur audio yang berhasil diambil untuk dianalisis.");
    }

    return NextResponse.json({
      topTracks: topTracks.items,
      favoriteGenres,
      averageAudioFeatures,
    });
  } catch (error) {
    console.error('[ANALYSIS_API_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
