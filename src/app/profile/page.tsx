// src/app/profile/page.tsx
"use client";
import useSWR from 'swr';
import React, { useState, useEffect } from 'react';

// --- Helper: Komponen Ikon Spotify (SVG) ---
const SpotifyIcon = () => (
  <svg role="img" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.903 17.51c-.22.359-.71.484-1.07.264-2.92-1.78-6.59-2.18-10.94-.99a.803.803 0 0 1-.92-.78.803.803 0 0 1 .78-.92c4.71-1.28 8.75-.81 11.95 1.14.36.22.48.71.26 1.07v-.01zm1.2-3.13c-.26.44-1.03.62-1.47.36-3.23-1.95-8.23-2.5-12.04-1.38a1 1 0 0 1-1.1-1.02 1 1 0 0 1 1.02-1.1c4.21-1.23 9.61-.61 13.24 1.58.44.26.62 1.03.35 1.47l-.01.09zm.1-3.36C15.21 8.31 9.72 8.13 5.61 9.31a1.25 1.25 0 0 1-1.38-1.22c0-.68.55-1.23 1.23-1.38 4.56-1.29 10.58-1.08 14.62 1.83.52.37.73 1.18.36 1.7-.36.52-1.18.73-1.7.36z" />
  </svg>
);

// --- Helper: Fungsi untuk format waktu ---
const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// --- Komponen Utama ---
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SpotifyCurrentTrack() {
  const { data, error } = useSWR('/api/now-playing', fetcher, {
    // Lakukan sinkronisasi dengan server setiap 5 detik
    refreshInterval: 5000,
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Jika lagu sedang diputar, mulai timer di sisi klien
    if (data?.isPlaying && data.progress_ms) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => prevProgress + 1000);
      }, 1000);

      // Set progress awal saat data berubah (sinkronisasi)
      setProgress(data.progress_ms);

      // Bersihkan timer saat komponen unmount atau data berubah
      return () => clearInterval(timer);
    }
  }, [data?.progress_ms, data?.isPlaying]);

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#2a273f] text-white rounded-lg p-4 w-full max-w-xs font-sans shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-semibold text-gray-300 tracking-wider uppercase">
          {data?.isPlaying ? "Listening to Spotify" : "Last Played on Spotify"}
        </p>
        <SpotifyIcon />
      </div>
      {children}
    </div>
  );

  if (error) return <Card><div>Gagal memuat data...</div></Card>;
  if (!data) return <Card><div>Loading...</div></Card>;

  const progressPercentage = data.isPlaying ? (progress / data.duration_ms) * 100 : 0;

  return (
    <Card>
      <div className="flex gap-4 items-center">
        <img
          src={data.album.images[0].url}
          alt={data.name}
          width={80}
          height={80}
          className="rounded-md w-20 h-20"
        />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white truncate">{data.name}</div>
          <div className="text-sm text-gray-300 truncate">{data.artists.join(", ")}</div>

          {data.isPlaying && (
            <>
              {/* Progress Bar */}
              <div className="w-full bg-gray-600 rounded-full h-1.5 mt-3">
                <div className="bg-white h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              {/* Durasi Waktu */}
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(data.duration_ms)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

// --- Halaman Profil ---
export default function Profile() {
  return (
    <main className="bg-gray-900 min-h-screen flex items-center justify-center">
      <SpotifyCurrentTrack />
    </main>
  );
}