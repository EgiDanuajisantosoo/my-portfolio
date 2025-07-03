'use client';

import useSWR from 'swr';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// --- Helper: Komponen Ikon Spotify (SVG) ---
const SpotifyIcon = () => (
  <svg role="img" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.903 17.51c-.22.359-.71.484-1.07.264-2.92-1.78-6.59-2.18-10.94-.99a.803.803 0 0 1-.92-.78.803.803 0 0 1 .78-.92c4.71-1.28 8.75-.81 11.95 1.14.36.22.48.71.26 1.07v-.01zm1.2-3.13c-.26.44-1.03.62-1.47.36-3.23-1.95-8.23-2.5-12.04-1.38a1 1 0 0 1-1.1-1.02 1 1 0 0 1 1.02-1.1c4.21-1.23 9.61-.61 13.24 1.58.44.26.62 1.03.35 1.47l-.01.09zm.1-3.36C15.21 8.31 9.72 8.13 5.61 9.31a1.25 1.25 0 0 1-1.38-1.22c0-.68.55-1.23 1.23-1.38 4.56-1.29 10.58-1.08 14.62 1.83.52.37.73 1.18.36 1.7-.36.52-1.18.73-1.7.36z" />
  </svg>
);

// --- Helper: Fungsi untuk format waktu mm:ss ---
const formatTime = (ms: number) => {
  if (!ms || ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// --- Helper: Fungsi untuk format waktu relatif ---
const timeAgo = (isoString: string) => {
  if (!isoString) return '';
  const now = new Date();
  const played = new Date(isoString);
  const diffMs = now.getTime() - played.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 23) return new Intl.DateTimeFormat('id-ID').format(played);
  if (hours > 0) return `${hours} jam yang lalu`;
  if (minutes > 0) return `${minutes} menit yang lalu`;
  return `${seconds} detik yang lalu`;
};

// --- Komponen Utama ---
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SpotifyCurrentTrack() {
  const { data, error } = useSWR('/api/now-playing', fetcher, {
    // Periksa data baru setiap 2 detik agar lebih responsif
    refreshInterval: 2000,
  });

  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- useEffect yang sudah diperbaiki ---
  useEffect(() => {
    // Selalu bersihkan interval sebelumnya untuk mencegah beberapa timer berjalan bersamaan.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (data?.isPlaying) {
      // Jika lagu sedang diputar, set progress akurat dari API.
      setProgress(data.progress_ms);

      // Mulai interval baru untuk menyimulasikan progress.
      intervalRef.current = setInterval(() => {
        setProgress(prev => prev + 1000);
      }, 1000);
    } else {
      // Jika lagu tidak diputar, cukup set progress ke posisi terakhir yang diketahui.
      // Interval sudah dibersihkan di atas, jadi tidak akan berjalan.
      setProgress(data?.progress_ms ?? 0);
    }

    // Fungsi cleanup untuk saat komponen unmount.
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [data]); // Jalankan ulang effect ini setiap kali objek `data` dari SWR berubah.


  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#2a273f] text-white rounded-lg p-4 w-full max-w-xs font-sans shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-semibold text-gray-300 tracking-wider uppercase">
          {data?.isPlaying ? 'Listening to Spotify' : 'Last Played on Spotify'}
        </p>
        <a href="https://open.spotify.com/user/f9ui57alw48v8z4oba6z9hdde?si=1c9b19039d024d24" target="_blank" className='hover:cursor-pointer'>
          <SpotifyIcon />
        </a>
      </div>
      {children}
    </div>
  );

  if (error) return <Card><div>Gagal memuat data Spotify.</div></Card>;
  if (!data) return <Card><div>Loading...</div></Card>;

  // Batasi nilai progress agar tidak melebihi durasi lagu
  const clampedProgress = Math.min(progress, data?.duration_ms ?? progress);
  const progressPercentage = data?.isPlaying && data?.duration_ms
    ? (clampedProgress / data.duration_ms) * 100
    : 0;

  return (
    <Card>
      <div className="flex gap-4 items-center">
        {data.album?.images?.[0]?.url && (
          <img
            src={data.album.images[0].url}
            alt={data.name || 'Album Art'}
            width={80}
            height={80}
            className="rounded-md w-20 h-20 object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white truncate">{data.name}</div>
          <div className="text-sm text-gray-300 truncate">{data.artists?.join(', ')}</div>

          {!data.isPlaying && data.played_at && (
            <div className="text-xs text-gray-400 mt-1">
              Terakhir diputar: {timeAgo(data.played_at)}
            </div>
          )}

          {data.isPlaying && (
            <>
              <div className="w-full bg-gray-600 rounded-full h-1.5 mt-3">
                <div
                  className="bg-white h-1.5 rounded-full transition-all duration-1000 linear"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(clampedProgress)}</span>
                <span>{formatTime(data.duration_ms)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Portfolio() {
  return (
    <>
      {/* home */}
      <main id='home' className="bg-gray-900 min-h-screen flex flex-col justify-between items-center p-4">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-2">Selamat Datang di Portfolio Saya</h1>
        <p className="text-gray-400 text-sm">Ini adalah halaman Portfolio saya yang sederhana.</p>
        </div>
      </div>
      {/* Ikon tiga titik di bawah */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-2 justify-center">
        <div className="w-3 h-3 bg-white rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
      </div>
      </main>

      {/* tentang-saya */}
      <main
      id="tentang-saya"
      className="bg-[#1e1e1e] min-h-screen flex items-center justify-center p-8 text-white relative z-0"
      >
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Kolom Kiri: Gambar dan Ikon */}
        {/* <div className="content flex"> */}
        <div className="flex flex-col items-center md:items-start">
        <div className="w-[200px] h-72 rounded-full overflow-hidden">
          <Image
          src="/images/me.png" // Ganti dengan path gambar Anda
          alt="Foto Profil Egi Danuajisantoso"
          width={300}
          height={300}
          className="object-cover w-full h-full"
          />
        </div>
        </div>

        {/* Kolom Kanan: Teks Deskripsi */}
        <div className="flex flex-col justify-center">
        <div className="w-16 h-1 bg-gray-400 mb-4"></div>
        <h1 className="text-4xl font-extrabold uppercase tracking-wider mb-6">
          Tentang Saya
        </h1>
        <p className="text-gray-300 leading-relaxed mb-4">
          Saya adalah Egi Danuajisantoso seorang web developer yang bersemangat dan berdedikasi untuk terus berkembang dalam dunia pengembangan web. Saat ini, fokus utama saya adalah memperdalam keahlian dan mengoptimalkan penggunaan Laravel, framework PHP yang saya yakini sangat powerful dan efisien untuk membangun aplikasi web modern.
        </p>
        <p className="text-gray-300 leading-relaxed mb-4">
          Dengan pengalaman yang saya miliki dalam menggunakan Laravel, saya telah berhasil mengembangkan berbagai proyek, mulai dari aplikasi manajemen konten sederhana hingga sistem yang lumayan kompleks dengan integrasi API. Saya selalu berusaha untuk menulis kode yang bersih, terstruktur, dan mudah dipelihara, mengikuti praktik terbaik (best practices) dalam pengembangan perangkat lunak.
        </p>
        <p className="text-gray-300 leading-relaxed">
          Saya ingin bergabung dengan tim atau proyek yang memberikan kesempatan untuk belajar dari para ahli, berkolaborasi dalam solusi inovatif agar saya bisa mengukur kemampuan yang sudah saya pelajari.
        </p>
        </div>
      </div>
      {/* </div> */}
      {/* Ikon tiga titik di bawah */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-2 justify-center">
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-3 h-3 bg-white rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
      </div>
      </main>

      {/* pendidikan */}
      <main
      id="pendidikan"
      className="bg-[#101828] min-h-screen flex flex-col items-center justify-center text-center p-4 relative"
      >
      <div className="text-white w-full max-w-3xl mx-auto">
        {/* Judul Utama */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-widest mb-10 sm:mb-14 md:mb-16">
      Pendidikan
        </h1>

        {/* Daftar Pendidikan */}
        <div className="space-y-8 sm:space-y-10">
      {/* Entri 1: SMK */}
      <div className="px-2 sm:px-8">
        <h2 className="text-lg sm:text-xl font-bold tracking-wider text-white">
        SMK TELEKOMUNIKASI TUNAS HARAPAN
        </h2>
        <p className="text-gray-400 tracking-wider text-sm sm:text-base">
        Rekayasa Perangkat Lunak
        </p>
      </div>

      {/* Entri 2: Universitas */}
      <div className="px-2 sm:px-8">
        <h2 className="text-lg sm:text-xl font-bold tracking-wider text-white">
        TELKOM UNIVERSITY <span className="text-xs sm:text-sm">(Saat Ini)</span>
        </h2>
        <p className="text-gray-400 tracking-wider text-sm sm:text-base">
        D3 Rekayasa Perangkat Lunak Aplikasi
        </p>
      </div>
        </div>
      </div>
      {/* Ikon tiga titik di bawah */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-2 justify-center">
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-3 h-3 bg-white rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
      </div>
      </main>

      {/* pengalaman-kerja */}
      <main id='pengalaman-kerja' className="bg-[#1e1e1e] min-h-screen flex flex-col items-center justify-center text-center p-4 relative">
      <div className="text-white w-full max-w-3xl mx-auto">
        {/* Judul Utama */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-widest mb-10 sm:mb-14 md:mb-16">
      Pengalaman Kerja
        </h1>

        {/* Daftar Pendidikan */}
        <div className="space-y-8 sm:space-y-10">
      {/* Entri 1: SMK */}
      <div className="px-2 sm:px-8">
        <h2 className="text-lg sm:text-xl font-bold tracking-wider text-white">
        MAGANG 3 BULAN SAAT SMK
        </h2>
        <p className="text-gray-400 tracking-wider text-sm sm:text-base">
        {/* Rekayasa Perangkat Lunak */}
        </p>
      </div>

      {/* Entri 2: Universitas */}
      <div className="px-2 sm:px-8">
        <h2 className="text-lg sm:text-xl font-bold tracking-wider text-white">
        {/* TELKOM UNIVERSITY <span className="text-xs sm:text-sm">(Saat Ini)</span> */}
        </h2>
        <p className="text-gray-400 tracking-wider text-sm sm:text-base">
        {/* D3 Rekayasa Perangkat Lunak Aplikasi */}
        </p>
      </div>
        </div>
      </div>
      {/* Ikon tiga titik di bawah */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-2 justify-center">
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-3 h-3 bg-white rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
      </div>
      </main>

      {/* rincian-proyek */}
      <main id='rincian-proyek' className="bg-gray-900 min-h-screen flex flex-col justify-between items-center p-4">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-2">Project & Sertifikasi</h1>
        <p className="text-gray-400 text-sm">Ini adalah halaman Project & Sertifikasi saya</p>
        </div>
      </div>
      {/* Ikon tiga titik di bawah */}
      <div className="flex items-center gap-2 mt-6 justify-center">
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-3 h-3 bg-white rounded-full"></div>
      </div>
      </main>

      {/* Spotify Current Track */}
      {/* Komponen SpotifyCurrentTrack */}
      <div
      className="fixed left-1/2 transform -translate-x-1/2 transition-all duration-300 w-full max-w-xs sm:max-w-sm md:max-w-md px-2 bottom-[-100px] sm:left-auto sm:right-0 sm:bottom-[-100px] sm:translate-x-0"
      tabIndex={0}
      onClick={e => {
        if (window.innerWidth <= 640) {
        (e.currentTarget as HTMLDivElement).classList.add('!bottom-4');
        }
      }}
      onBlur={e => {
        if (window.innerWidth <= 640) {
        (e.currentTarget as HTMLDivElement).classList.remove('!bottom-4');
        }
      }}
      onTouchEnd={e => {
        if (window.innerWidth <= 640) {
        (e.currentTarget as HTMLDivElement).classList.add('!bottom-4');
        }
      }}
      onMouseEnter={e => {
        // Aktifkan efek hover di desktop (min-width: 641px)
        if (window.innerWidth > 640) {
        (e.currentTarget as HTMLDivElement).classList.add('!bottom-4');
        }
      }}
      onMouseLeave={e => {
        if (window.innerWidth > 640) {
        (e.currentTarget as HTMLDivElement).classList.remove('!bottom-4');
        }
      }}
      style={{}}
      >
      <SpotifyCurrentTrack />
      </div>
      <style jsx global>{`
      @media (max-width: 640px) {
        .!bottom-4 {
        bottom: 1rem !important;
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        }
      }
      @media (min-width: 641px) {
        .!bottom-4 {
        bottom: 1rem !important;
        right: 1rem !important;
        left: auto !important;
        transform: none !important;
        }
      }
      @media (min-width: 641px) {
        .fixed.sm\\:left-auto {
        left: auto !important;
        }
        .fixed.sm\\:right-4 {
        right: 1rem !important;
        }
        .fixed.sm\\:bottom-\\[-100px\\] {
        bottom: -100px !important;
        }
        .fixed.sm\\:translate-x-0 {
        transform: none !important;
        }
      }
      `}</style>
    </>
  );
}
