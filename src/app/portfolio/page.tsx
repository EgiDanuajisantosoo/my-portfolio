'use client';

import useSWR from 'swr';
import React, { useState, useEffect } from 'react';
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
    refreshInterval: 2000,
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(data?.progress_ms ?? 0);
  }, [data]);


  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#0a0f1a] text-white rounded-lg p-4 w-full max-w-xs font-sans shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-semibold text-gray-300 tracking-wider uppercase">
          {data?.isPlaying ? 'Mendengarkan Spotify saat ini' : 'Terakhir Diputar di Spotify'}
        </p>
        <a
          href={data?.songUrl || data?.external_urls?.spotify}
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
  // Tambahkan state untuk filter dan data proyek/sertifikat
  const [filter, setFilter] = useState<'all' | 'project' | 'certificate'>('all');

  const items = [
    {
      type: 'project',
      title: 'Website KontrakanKita',
      desc: 'Teknologi: Laravel 12, MySQL, Google Client API (OAuth 2.0), Pusher,Tailwind',
      image: '/proyek/kontrakanKita1.png',
      image1: '/proyek/kontrakanKita2.png',
      link: 'https://github.com/EgiDanuajisantosoo/KontrakanKita',
    },
    {
      type: 'project',
      title: 'Website UsahaKita',
      desc: 'Teknologi: Laravel 11, MySQL,fillament, Tailwind',
      image: '/proyek/usahaKita1.png',
      image1: '/proyek/usahaKita2.png',
      link: 'https://github.com/EgiDanuajisantosoo/pbw2_Tubes_UsahaKita',
    },
    {
      type: 'project',
      title: 'Website Rental Mobil',
      desc: 'Tailwind,JavaScript,HTML,CSS,Aos.js',
      image: '/proyek/rentCar1.png',
      image1: '/proyek/rentCar2.png',
      link: 'https://github.com/EgiDanuajisantosoo/RentCar',
    },
    {
      type: 'certificate',
      title: 'Sertifikat Junor Web Developer',
      desc: 'Sertifikat pelatihan Junor Web Developer dari Badan Nasional Sertifikasi Profesi.',
      image: '/sertifikasi/juniorWebDev.png',
      image1: '/null',
      link: '/sertifikasi/juniorWebDev.png',
    },
    {
      type: 'certificate',
      title: 'Sertifikat Office Application',
      desc: 'Sertifikat pelatihan Office Application dari Badan Nasional Sertifikasi Profesi.',
      image: '/sertifikasi/OfficeApplication.png',
      image1: '/null',
      link: '/sertifikasi/OfficeApplication.png',
    },
    // Tambahkan item lain sesuai kebutuhan
  ];

  // Filter item sesuai tab yang dipilih
  const filteredItems =
    filter === 'all'
      ? items
      : items.filter((item) => item.type === filter);

  return (
<>
<style jsx global>{`
  html, body {
    /* overflow: hidden; */
    /* Gunakan ini agar scrollbar tetap ada, tapi tidak terlihat */
    overflow: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }
  html::-webkit-scrollbar, body::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`}</style>

      {/* home */}
      <main id='home' className="bg-gray-900 min-h-screen flex flex-col justify-between items-center p-4">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-2">Selamat Datang di Web Portfolio Saya</h1>
            <p className="text-gray-400 text-2xl">Ini adalah halaman Portfolio saya yang sederhana.</p>
          </div>
        </div>
        {/* Ikon tiga titik di bawah */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-2 justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      </main>

      {/* tentang-saya */}
      <main
        id="tentang-saya"
        className="bg-[#162139] min-h-screen flex items-center justify-center p-8 text-white relative z-0"
      >
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Kolom Kiri: Gambar dan Ikon */}
          {/* <div className="content flex"> */}
          <div className="flex flex-col items-center relative w-full">
            <div className="w-[150px] h-[200px] sm:w-[250px] sm:h-[350px] md:w-[300px] md:h-[400px] lg:w-[320px] lg:h-[480px] rounded-full overflow-hidden flex justify-center items-center mx-auto">
              <Image
                src="/images/me.png"
                alt="Foto Profil Egi Danuajisantoso"
                width={350}
                height={350}
                className="object-cover w-full h-full"
                priority
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
            <div className="flex flex-col items-center justify-center w-full mt-6 mb-2 px-2 sm:px-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
              <span className="inline-block w-8 h-1 bg-gradient-to-r from-[#1ed760] to-[#23a455] rounded-full"></span>
              <h6 className="text-base sm:text-lg font-bold text-[#1ed760] uppercase tracking-wider drop-shadow">
                Motto
              </h6>
              <span className="inline-block w-8 h-1 bg-gradient-to-l from-[#1ed760] to-[#23a455] rounded-full"></span>
              </div>
              <blockquote className="relative bg-[#1ed760]/10 border-l-4 border-[#1ed760] px-3 py-3 sm:px-6 rounded-md shadow-md max-w-xs sm:max-w-sm md:max-w-md text-center">
              <span className="text-xl sm:text-2xl text-[#1ed760] font-bold leading-none mr-1">“</span>
              <span className="italic text-white font-semibold text-sm sm:text-base tracking-wide break-words">
                Hidup itu pilihan, jadi setiap keputusan yang Anda pilih akan menentukan kehidupan Anda...
              </span>
              <span className="text-xl sm:text-2xl text-[#1ed760] font-bold leading-none ml-1">”</span>
              </blockquote>
            </div>
          </div>

          {/* Kolom Kanan: Teks Deskripsi */}
          <div className="flex flex-col justify-center">
            <div className="w-16 h-1 bg-gray-400 mb-4"></div>
            <h1 className="text-3xl font-extrabold uppercase tracking-wider mb-6">
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
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      </main>

      {/* keahlian */}
      <main
        id="keahlian"
        className="bg-[#101828] min-h-screen flex flex-col items-center justify-center text-center p-4 relative"
      >
        <div className="text-white w-full max-w-3xl mx-auto">
          {/* Judul Utama */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-widest mb-10 sm:mb-14 md:mb-16">
            Keahlihan
          </h1>

          {/* Statistik Keahlian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
            {/* Skill 1 */}
            <div className="bg-[#1a2b50] rounded-lg shadow-md p-6 flex flex-col items-center">
              <Image src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA5FJREFUWEfFVktrE1EU/s6ksY9QrZidLvwBLhVBFyqIWF9oYpcFN4oovqla2tpWrS5ErIIgunRrJxEqvl8oaMWN4E9wJ0UrpIg299hzcye5M5NJJrHiQBaZe+d+3znnu985hP/8UDV87u1NoVDYr9dSqTt0927hX/H0ETDARwGcArDMgE4DuIpU6sa/IKIJaODZ2eNg7gOwxAC/BSDr683/GRBdQUfH+EISIc5kDgG4ZAF/BvMg5XL3NblsdieYZX1VmQjzAOVyNxeiLEKgCMAxhz1FOr2dbt/+bR/O3d2taG+fBLDZvC+S67bUIxBHS0KAAwd9AdE1/Pp1S79ftOggmE8CWG7vI9etKuBySQuFWFqqEHCcTVBqBMAGDUT0DUolQLTYAL+G44xAqZcAFLluIpgBS0snLBEHtTStAzRaKhPwIuK9ezf6iAAamO7de6WjK2UsRIAzmSMALjSopb4QAS8qrzTBVNcgoMytkSPiakk1SwA2MZbrmskIAfuJp6U6kfqA6pSgJObGtIQFyYBFrExYa6lYHAbRRk2M+RUSidGAlhaGgF2CCM1EZbJpAr5bwLt3d8FxvulIlVpK+fz3WmK29zdbAibXdcxBYlLH5xtWZ9mqgXEoNS5EbI2Z/bJXftJzfjZLQBQ/5gNmfg6iNl/zEiLAsCE2agHLq8cAhhoi4Et15cK9BPM5yuXE8cB79uwA0WWreQUNU/ZLM3unDTfONaySOvn2AYhGaGLiY8iSDxxI4uvXSRBtKa9JhoARj6j3vi6BeZLB1L0F82kvAhucBXh6uhfMQwBWWmtVe0esDFiHfIJS/ZTPPwxFvG9fG378kBHuNIAVZv29HnCI3migiO4ZJwPy/TOk09tCc0JPTzuKRRlozgJIG+ApMEuqH1kGpW9NkHijGah4O1ECyeRRMNtt19c1a/mATaQyD0QYSAxvF00MUy73IlSaikHV1MBPAK0AZhBhIDqV4TlBgMe8VPvEuGtXJ1pajhkNyEAzS66biirBmvkedh7AVp+TGQOJ6+2apAdcGuu7zHmPQDRU7bpqDZRrlc2uBfNFa/AsLcXxdgFOJg+D+YwF/AxEgzQxMVUt8rIPhOqWza6GUmOWiUhjEW+/HvL2UsQSreft0nafwHEGoiIO4kVPtuGMlDTieTtRfzMRxyZglSaYEf8ZDUbcMIFIIn8JHKmBWoIx13Ed5ubmKJ//UG9vnPU/wIt7geM9emEAAAAASUVORK5CYII=" alt="Laravel" width={48} height={48} className="mb-3" />
              <h2 className="text-lg font-bold mb-1">Laravel</h2>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-[#ff2d20] h-3 rounded-full transition-all" style={{ width: '85%' }} />
              </div>
              <span className="text-sm text-gray-300">90%</span>
            </div>
            {/* Skill 2 */}
            <div className="bg-[#1a2b50] rounded-lg shadow-md p-6 flex flex-col items-center">
              <Image src="data:image/png;base64,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" alt="PHP" width={48} height={48} className="mb-3" />
              <h2 className="text-lg font-bold mb-1">PHP</h2>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-[#8993be] h-3 rounded-full transition-all" style={{ width: '80%' }} />
              </div>
              <span className="text-sm text-gray-300">80%</span>
            </div>
            {/* Skill 3 */}
            <div className="bg-[#1a2b50] rounded-lg shadow-md p-6 flex flex-col items-center">
              <Image src="data:image/png;base64,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" alt="MySQL" width={48} height={48} className="mb-3" />
              <h2 className="text-lg font-bold mb-1">MySQL</h2>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-[#00758f] h-3 rounded-full transition-all" style={{ width: '85%' }} />
              </div>
              <span className="text-sm text-gray-300">85%</span>
            </div>
            {/* Skill 4 */}
            <div className="bg-[#1a2b50] rounded-lg shadow-md p-6 flex flex-col items-center">
              <Image src="data:image/png;base64,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" alt="JavaScript" width={48} height={48} className="mb-3" />
              <h2 className="text-lg font-bold mb-1">JavaScript</h2>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-[#f7df1e] h-3 rounded-full transition-all" style={{ width: '75%' }} />
              </div>
              <span className="text-sm text-gray-300">75%</span>
            </div>
            {/* Skill 5 */}
            <div className="bg-[#1a2b50] rounded-lg shadow-md p-6 flex flex-col items-center">
              <Image src="data:image/png;base64,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" alt="Tailwind CSS" width={48} height={48} className="mb-3" />
              <h2 className="text-lg font-bold mb-1">Tailwind CSS</h2>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-[#38bdf8] h-3 rounded-full transition-all" style={{ width: '95%' }} />
              </div>
              <span className="text-sm text-gray-300">95%</span>
            </div>
            {/* Skill 6 */}
            <div className="bg-[#1a2b50] rounded-lg shadow-md p-6 flex flex-col items-center">
              <Image src="data:image/png;base64,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" alt="HTML5" width={48} height={48} className="mb-3" />
              <h2 className="text-lg font-bold mb-1">HTML5 & CSS3</h2>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-[#e44d26] h-3 rounded-full transition-all" style={{ width: '95%' }} />
              </div>
              <span className="text-sm text-gray-300">95%</span>
            </div>
            <div className="bg-[#1a2b50] rounded-lg shadow-md p-6 flex flex-col items-center">
              <Image src="data:image/png;base64,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" alt="HTML5" width={48} height={48} className="mb-3" />
              <h2 className="text-lg font-bold mb-1">NextJS</h2>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-[#e44d26] h-3 rounded-full transition-all" style={{ width: '50%' }} />
              </div>
              <span className="text-sm text-gray-300">50%</span>
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
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      </main>

      {/* pendidikan */}
      <main
        id="pendidikan"
        className="bg-[#162139] min-h-screen flex flex-col items-center justify-center text-center p-4 relative"
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
                SMK TELEKOMUNIKASI TUNAS HARAPAN (<span className="text-xs sm:text-sm">2020 - 2023</span>)
              </h2>
              <p className="text-gray-400 tracking-wider text-sm sm:text-base">
                Rekayasa Perangkat Lunak
              </p>
            </div>

            {/* Entri 2: Universitas */}
            <div className="px-2 sm:px-8">
              <h2 className="text-lg sm:text-xl font-bold tracking-wider text-white">
                TELKOM UNIVERSITY (<span className="text-xs sm:text-sm">2023 - Saat Ini</span>)
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
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      </main>

      {/* pengalaman-kerja */}
      <main id='pengalaman-kerja' className="bg-[#101828] min-h-screen flex flex-col items-center justify-center text-center p-4 relative">
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
                MAGANG 3 BULAN (<span className="text-xs sm:text-sm">SAAT SMK</span>)
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
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      </main>

      {/* rincian-proyek */}
      <main id='rincian-proyek' className="bg-[#162139] min-h-screen flex flex-col justify-between items-center p-4">
        <div className="flex items-center justify-start flex-1">
          <div className="text-center text-white mt-8">
            <h1 className="text-3xl font-bold mb-2">Project & Sertifikasi</h1>
            <p className="text-gray-400 text-sm">Ini adalah halaman Project & Sertifikasi saya</p>
          </div>
        </div>
        {/* Filter Tabs */}
        <div className="flex justify-center gap-4 mt-5 mb-6">
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-colors hover:cursor-pointer ${
              filter === 'all'
          ? 'bg-[#1ed760] text-white'
          : 'bg-[#1a2b50] text-gray-300 hover:bg-[#1a2b50c4]'
            }`}
            onClick={() => setFilter('all')}
          >
            Semua
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-colors hover:cursor-pointer ${
              filter === 'project'
          ? 'bg-[#1ed760] text-white'
          : 'bg-[#1a2b50] text-gray-300 hover:bg-[#1a2b50c4]'
            }`}
            onClick={() => setFilter('project')}
          >
            Project
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-colors hover:cursor-pointer ${
              filter === 'certificate'
          ? 'bg-[#1ed760] text-white'
          : 'bg-[#1a2b50] text-gray-300 hover:bg-[#1a2b50c4]'
            }`}
            onClick={() => setFilter('certificate')}
          >
            Sertifikasi
          </button>
        </div>

        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <div key={idx} className="bg-[#1a2b50] rounded-lg shadow-lg p-5 flex flex-col items-center">
              <Image
          src={item.image}
          alt={item.title}
          width={200}
          height={120}
          className="rounded-md object-cover mb-4"
              />
          {item.image1 !== '/null' && (
            <Image
              src={item.image1}
              alt={item.title}
              width={200}
              height={120}
              className="rounded-md object-cover mb-4"
            />
          )}
              
              <h2 className="text-lg font-bold text-white mb-2">{item.title}</h2>
              <p className="text-gray-300 text-sm mb-4 text-center">{item.desc}</p>
              <a
          href={item.link}
          target="_blank"
          className="text-[#1ed760] font-semibold hover:underline"
              >
          {item.type === 'certificate' ? 'Lihat Sertifikat' : 'Lihat Project'}
              </a>
            </div>
          ))}
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
