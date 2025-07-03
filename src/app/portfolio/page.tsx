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
        <a
          href={data?.songUrl || "https://open.spotify.com/user/f9ui57alw48v8z4oba6z9hdde?si=1c9b19039d024d24"}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:cursor-pointer"
        >
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
            <p className="text-gray-400 text-1xl">Ini adalah halaman Portfolio saya yang sederhana.</p>
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
          <div className="flex flex-col items-center relative w-full">
            <div className="w-[200px] h-72 rounded-full overflow-hidden flex justify-center items-center mx-auto">
              <Image
                src="/images/me.png"
                alt="Foto Profil Egi Danuajisantoso"
                width={300}
                height={300}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex items-center gap-4 justify-center w-full mt-6 mb-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <a href="https://www.instagram.com/egi_danuajisantoso" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 256 256"><g fill="none"><rect width={256} height={256} fill="url(#skillIconsInstagram0)" rx={60}></rect><rect width={256} height={256} fill="url(#skillIconsInstagram1)" rx={60}></rect><path fill="#fff" d="M128.009 28c-27.158 0-30.567.119-41.233.604c-10.646.488-17.913 2.173-24.271 4.646c-6.578 2.554-12.157 5.971-17.715 11.531c-5.563 5.559-8.98 11.138-11.542 17.713c-2.48 6.36-4.167 13.63-4.646 24.271c-.477 10.667-.602 14.077-.602 41.236s.12 30.557.604 41.223c.49 10.646 2.175 17.913 4.646 24.271c2.556 6.578 5.973 12.157 11.533 17.715c5.557 5.563 11.136 8.988 17.709 11.542c6.363 2.473 13.631 4.158 24.275 4.646c10.667.485 14.073.604 41.23.604c27.161 0 30.559-.119 41.225-.604c10.646-.488 17.921-2.173 24.284-4.646c6.575-2.554 12.146-5.979 17.702-11.542c5.563-5.558 8.979-11.137 11.542-17.712c2.458-6.361 4.146-13.63 4.646-24.272c.479-10.666.604-14.066.604-41.225s-.125-30.567-.604-41.234c-.5-10.646-2.188-17.912-4.646-24.27c-2.563-6.578-5.979-12.157-11.542-17.716c-5.562-5.562-11.125-8.979-17.708-11.53c-6.375-2.474-13.646-4.16-24.292-4.647c-10.667-.485-14.063-.604-41.23-.604zm-8.971 18.021c2.663-.004 5.634 0 8.971 0c26.701 0 29.865.096 40.409.575c9.75.446 15.042 2.075 18.567 3.444c4.667 1.812 7.994 3.979 11.492 7.48c3.5 3.5 5.666 6.833 7.483 11.5c1.369 3.52 3 8.812 3.444 18.562c.479 10.542.583 13.708.583 40.396s-.104 29.855-.583 40.396c-.446 9.75-2.075 15.042-3.444 18.563c-1.812 4.667-3.983 7.99-7.483 11.488c-3.5 3.5-6.823 5.666-11.492 7.479c-3.521 1.375-8.817 3-18.567 3.446c-10.542.479-13.708.583-40.409.583c-26.702 0-29.867-.104-40.408-.583c-9.75-.45-15.042-2.079-18.57-3.448c-4.666-1.813-8-3.979-11.5-7.479s-5.666-6.825-7.483-11.494c-1.369-3.521-3-8.813-3.444-18.563c-.479-10.542-.575-13.708-.575-40.413s.096-29.854.575-40.396c.446-9.75 2.075-15.042 3.444-18.567c1.813-4.667 3.983-8 7.484-11.5s6.833-5.667 11.5-7.483c3.525-1.375 8.819-3 18.569-3.448c9.225-.417 12.8-.542 31.437-.563zm62.351 16.604c-6.625 0-12 5.37-12 11.996c0 6.625 5.375 12 12 12s12-5.375 12-12s-5.375-12-12-12zm-53.38 14.021c-28.36 0-51.354 22.994-51.354 51.355s22.994 51.344 51.354 51.344c28.361 0 51.347-22.983 51.347-51.344c0-28.36-22.988-51.355-51.349-51.355zm0 18.021c18.409 0 33.334 14.923 33.334 33.334c0 18.409-14.925 33.334-33.334 33.334s-33.333-14.925-33.333-33.334c0-18.411 14.923-33.334 33.333-33.334"></path><defs><radialGradient id="skillIconsInstagram0" cx={0} cy={0} r={1} gradientTransform="matrix(0 -253.715 235.975 0 68 275.717)" gradientUnits="userSpaceOnUse"><stop stopColor="#fd5"></stop><stop offset={0.1} stopColor="#fd5"></stop><stop offset={0.5} stopColor="#ff543e"></stop><stop offset={1} stopColor="#c837ab"></stop></radialGradient><radialGradient id="skillIconsInstagram1" cx={0} cy={0} r={1} gradientTransform="matrix(22.25952 111.2061 -458.39518 91.75449 -42.881 18.441)" gradientUnits="userSpaceOnUse"><stop stopColor="#3771c8"></stop><stop offset={0.128} stopColor="#3771c8"></stop><stop offset={1} stopColor="#60f" stopOpacity={0}></stop></radialGradient></defs></g></svg>
                </a>
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <a href="https://github.com/EgiDanuajisantosoo" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 256 256"><g fill="none"><rect width={256} height={256} fill="#f4f2ed" rx={60}></rect><path fill="#161614" d="M128.001 30C72.779 30 28 74.77 28 130.001c0 44.183 28.653 81.667 68.387 94.89c4.997.926 6.832-2.169 6.832-4.81c0-2.385-.093-10.262-.136-18.618c-27.82 6.049-33.69-11.799-33.69-11.799c-4.55-11.559-11.104-14.632-11.104-14.632c-9.073-6.207.684-6.079.684-6.079c10.042.705 15.33 10.305 15.33 10.305c8.919 15.288 23.394 10.868 29.1 8.313c.898-6.464 3.489-10.875 6.349-13.372c-22.211-2.529-45.56-11.104-45.56-49.421c0-10.918 3.906-19.839 10.303-26.842c-1.039-2.519-4.462-12.69.968-26.464c0 0 8.398-2.687 27.508 10.25c7.977-2.215 16.531-3.326 25.03-3.364c8.498.038 17.06 1.149 25.051 3.365c19.087-12.939 27.473-10.25 27.473-10.25c5.443 13.773 2.019 23.945.98 26.463c6.412 7.003 10.292 15.924 10.292 26.842c0 38.409-23.394 46.866-45.662 49.341c3.587 3.104 6.783 9.189 6.783 18.519c0 13.38-.116 24.149-.116 27.443c0 2.661 1.8 5.779 6.869 4.797C199.383 211.64 228 174.169 228 130.001C228 74.771 183.227 30 128.001 30M65.454 172.453c-.22.497-1.002.646-1.714.305c-.726-.326-1.133-1.004-.898-1.502c.215-.512.999-.654 1.722-.311c.727.326 1.141 1.01.89 1.508m4.919 4.389c-.477.443-1.41.237-2.042-.462c-.654-.697-.777-1.629-.293-2.078c.491-.442 1.396-.235 2.051.462c.654.706.782 1.631.284 2.078m3.374 5.616c-.613.426-1.615.027-2.234-.863c-.613-.889-.613-1.955.013-2.383c.621-.427 1.608-.043 2.236.84c.611.904.611 1.971-.015 2.406m5.707 6.504c-.548.604-1.715.442-2.57-.383c-.874-.806-1.118-1.95-.568-2.555c.555-.606 1.729-.435 2.59.383c.868.804 1.133 1.957.548 2.555m7.376 2.195c-.242.784-1.366 1.14-2.499.807c-1.13-.343-1.871-1.26-1.642-2.052c.235-.788 1.364-1.159 2.505-.803c1.13.341 1.871 1.252 1.636 2.048m8.394.932c.028.824-.932 1.508-2.121 1.523c-1.196.027-2.163-.641-2.176-1.452c0-.833.939-1.51 2.134-1.53c1.19-.023 2.163.639 2.163 1.459m8.246-.316c.143.804-.683 1.631-1.864 1.851c-1.161.212-2.236-.285-2.383-1.083c-.144-.825.697-1.651 1.856-1.865c1.183-.205 2.241.279 2.391 1.097"></path></g></svg>
                </a>
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <a href="https://www.linkedin.com/in/egi-danuajisantoso" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 128 128"><path fill="#0076b2" d="M116 3H12a8.91 8.91 0 0 0-9 8.8v104.42a8.91 8.91 0 0 0 9 8.78h104a8.93 8.93 0 0 0 9-8.81V11.77A8.93 8.93 0 0 0 116 3"></path><path fill="#fff" d="M21.06 48.73h18.11V107H21.06zm9.06-29a10.5 10.5 0 1 1-10.5 10.49a10.5 10.5 0 0 1 10.5-10.49m20.41 29h17.36v8h.24c2.42-4.58 8.32-9.41 17.13-9.41C103.6 47.28 107 59.35 107 75v32H88.89V78.65c0-6.75-.12-15.44-9.41-15.44s-10.87 7.36-10.87 15V107H50.53z"></path></svg>

                </a>
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <a href="https://discord.com/users/688864050989367357" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 256 256"><g fill="none"><rect width={256} height={256} fill="#5865f2" rx={60}></rect><g clipPath="url(#skillIconsDiscord0)"><path fill="#fff" d="M197.308 64.797a165 165 0 0 0-40.709-12.627a.62.62 0 0 0-.654.31c-1.758 3.126-3.706 7.206-5.069 10.412c-15.373-2.302-30.666-2.302-45.723 0c-1.364-3.278-3.382-7.286-5.148-10.412a.64.64 0 0 0-.655-.31a164.5 164.5 0 0 0-40.709 12.627a.6.6 0 0 0-.268.23c-25.928 38.736-33.03 76.52-29.546 113.836a.7.7 0 0 0 .26.468c17.106 12.563 33.677 20.19 49.94 25.245a.65.65 0 0 0 .702-.23c3.847-5.254 7.276-10.793 10.217-16.618a.633.633 0 0 0-.347-.881c-5.44-2.064-10.619-4.579-15.601-7.436a.642.642 0 0 1-.063-1.064a86 86 0 0 0 3.098-2.428a.62.62 0 0 1 .646-.088c32.732 14.944 68.167 14.944 100.512 0a.62.62 0 0 1 .655.08a80 80 0 0 0 3.106 2.436a.642.642 0 0 1-.055 1.064a102.6 102.6 0 0 1-15.609 7.428a.64.64 0 0 0-.339.889a133 133 0 0 0 10.208 16.61a.64.64 0 0 0 .702.238c16.342-5.055 32.913-12.682 50.02-25.245a.65.65 0 0 0 .26-.46c4.17-43.141-6.985-80.616-29.571-113.836a.5.5 0 0 0-.26-.238M94.834 156.142c-9.855 0-17.975-9.047-17.975-20.158s7.963-20.158 17.975-20.158c10.09 0 18.131 9.127 17.973 20.158c0 11.111-7.962 20.158-17.973 20.158m66.456 0c-9.855 0-17.974-9.047-17.974-20.158s7.962-20.158 17.974-20.158c10.09 0 18.131 9.127 17.974 20.158c0 11.111-7.884 20.158-17.974 20.158"></path></g><defs><clipPath id="skillIconsDiscord0"><path fill="#fff" d="M28 51h200v154.93H28z"></path></clipPath></defs></g></svg>

                </a>
              </div>
              <div className="w-7 h-7 flex items-center justify-center">
                <a href="https://open.spotify.com/user/f9ui57alw48v8z4oba6z9hdde?si=66ebe92df1f94125" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 256 256"><path fill="#1ed760" d="M128 0C57.308 0 0 57.309 0 128c0 70.696 57.309 128 128 128c70.697 0 128-57.304 128-128C256 57.314 198.697.007 127.998.007zm58.699 184.614c-2.293 3.76-7.215 4.952-10.975 2.644c-30.053-18.357-67.885-22.515-112.44-12.335a7.98 7.98 0 0 1-9.552-6.007a7.97 7.97 0 0 1 6-9.553c48.76-11.14 90.583-6.344 124.323 14.276c3.76 2.308 4.952 7.215 2.644 10.975m15.667-34.853c-2.89 4.695-9.034 6.178-13.726 3.289c-34.406-21.148-86.853-27.273-127.548-14.92c-5.278 1.594-10.852-1.38-12.454-6.649c-1.59-5.278 1.386-10.842 6.655-12.446c46.485-14.106 104.275-7.273 143.787 17.007c4.692 2.89 6.175 9.034 3.286 13.72zm1.345-36.293C162.457 88.964 94.394 86.71 55.007 98.666c-6.325 1.918-13.014-1.653-14.93-7.978c-1.917-6.328 1.65-13.012 7.98-14.935C93.27 62.027 168.434 64.68 215.929 92.876c5.702 3.376 7.566 10.724 4.188 16.405c-3.362 5.69-10.73 7.565-16.4 4.187z"></path></svg>
                </a>
              </div>
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
                SMK TELEKOMUNIKASI TUNAS HARAPAN (2020 - 2023)
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
                MAGANG 3 BULAN (SAAT SMK)
              </h2>
              <a href='' className="text-gray-400 tracking-wider text-sm sm:text-base">
                PT. Adhikari Inovasi Indonesia
              </a>
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
        <div className="flex flex-col items-center justify-start flex-1 w-full">
          <div className="text-center text-white mt-8">
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
        className="fixed left-1/2 transform -translate-x-1/2 transition-all duration-300 w-full max-w-xs px-2 bottom-[-100px] sm:left-auto sm:right-0 sm:bottom-[-100px] sm:translate-x-0"
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
