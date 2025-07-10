'use client';

import useSWR from 'swr';
import React from 'react';

// --- Tipe Data Spotify ---
interface Artist {
  name: string;
}
interface Track {
  id: string;
  name: string;
  artists: Artist[];
}
interface AverageAudioFeatures {
  valence: number;
  energy: number;
  danceability: number;
  acousticness: number;
}
interface SpotifyAnalysisData {
  favoriteGenres: string[];
  averageAudioFeatures: AverageAudioFeatures;
  topTracks: Track[];
}

// --- Fetcher ---
const fetcher = (url: string): Promise<SpotifyAnalysisData> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Gagal mengambil data dari server');
    return res.json();
  });

// --- StatBar Komponen ---
const StatBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const percentage = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-base font-medium text-slate-300">{label}</span>
        <span className="text-lg font-bold text-emerald-400">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div
          className="bg-emerald-500 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- Komponen Utama ---
const Dashboard: React.FC = () => {
  const { data, error } = useSWR<SpotifyAnalysisData>('/api/analysis', fetcher);

  if (error) return <div className="text-center text-red-400 mt-10">Gagal memuat data. Silakan coba lagi nanti.</div>;
  if (!data) return <div className="text-center text-white mt-10">Memuat DNA musikmu... 🧬</div>;

  const { favoriteGenres, averageAudioFeatures, topTracks } = data;

  // Fallback check
  if (!topTracks || !favoriteGenres || !averageAudioFeatures) {
    return <div className="text-center text-yellow-400 mt-10">Data tidak lengkap dari Spotify.</div>;
  }

  const mood = averageAudioFeatures.valence > 0.5 ? 'Ceria 😄' : 'Melankolis 😔';
  const topFiveTracks = topTracks.slice(0, 50);

  return (
    <div className="bg-slate-900 text-white min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Judul */}
        <h1 className="text-4xl lg:text-5xl font-bold text-center mb-8 lg:mb-12">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            Analisis Spotify Saya
          </span>
        </h1>

        {/* Layout Utama */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Kolom Kiri: Top Tracks */}
          <section className="xl:col-span-2 bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-semibold mb-5 text-emerald-400 flex items-center gap-3">
              🎵 Top 5 Lagu Saat Ini
            </h2>
            <ol className="space-y-3">
              {topFiveTracks.map((track, index) => (
                <li
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <span className="text-2xl font-bold text-slate-500 w-8 text-center">{index + 1}</span>
                  <div className="flex-grow">
                    <p className="font-bold text-lg truncate">{track.name}</p>
                    <p className="text-sm text-slate-400 truncate">{track.artists.map((a) => a.name).join(', ')}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Kolom Kanan */}
          <div className="space-y-8">
            {/* Genre */}
            <section className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4 text-emerald-400 flex items-center gap-3">
                🎶 Top 5 Genres
              </h2>
              <ul className="flex flex-wrap gap-2">
                {favoriteGenres.map((genre) => (
                  <li
                    key={genre}
                    className="bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-600"
                  >
                    {genre}
                  </li>
                ))}
              </ul>
            </section>

            {/* DNA Musik */}
            <section className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-2 text-emerald-400 flex items-center gap-3">
                🧬 DNA Musikmu
              </h2>
              <p className="text-center text-slate-300 mb-5">
                Suasana hatimu secara umum: <strong className="text-white">{mood}</strong>
              </p>
              <div className="space-y-5">
                <StatBar label="Energi" value={averageAudioFeatures.energy} />
                <StatBar label="Danceability" value={averageAudioFeatures.danceability} />
                <StatBar label="Positif (Valence)" value={averageAudioFeatures.valence} />
                <StatBar label="Akustik" value={averageAudioFeatures.acousticness} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
