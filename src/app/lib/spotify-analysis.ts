import { AudioFeature, AudioFeaturesResponse, AverageAudioFeatures, TopArtistsResponse } from "./types";

export function analyzeGenres(topArtists: TopArtistsResponse): string[] {
  const genreCounts = topArtists.items
    .flatMap((artist) => artist.genres)
    .reduce((acc: Record<string, number>, genre: string) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre);
}

export function analyzeAudioFeatures(audioFeatures: AudioFeaturesResponse): AverageAudioFeatures {
  // FIX: Use a type guard to ensure TypeScript knows we've filtered out nulls.
  const validFeatures = audioFeatures.audio_features.filter(
    (af): af is AudioFeature => af !== null
  );
  const trackCount = validFeatures.length;

  if (trackCount === 0) {
    return { energy: 0, danceability: 0, valence: 0, acousticness: 0 };
  }

  // Now, `features` inside reduce is correctly typed as `AudioFeature`, not `AudioFeature | null`.
  const totalFeatures = validFeatures.reduce(
    (acc: { energy: any; danceability: any; valence: any; acousticness: any; }, features: { energy: any; danceability: any; valence: any; acousticness: any; }) => {
      acc.energy += features.energy;
      acc.danceability += features.danceability;
      acc.valence += features.valence;
      acc.acousticness += features.acousticness;
      return acc;
    },
    { energy: 0, danceability: 0, valence: 0, acousticness: 0 }
  );

  return {
    energy: totalFeatures.energy / trackCount,
    danceability: totalFeatures.danceability / trackCount,
    valence: totalFeatures.valence / trackCount,
    acousticness: totalFeatures.acousticness / trackCount,
  };
}