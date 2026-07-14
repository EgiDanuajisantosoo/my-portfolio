'use client';

import React, { useState } from 'react';
import { SpotifyCurrentTrack } from '@/components/SpotifyCurrentTrack';

export default function SpotifyFloating() {
  const [isSpotifyOpen, setIsSpotifyOpen] = useState(false);

  return (
    <>
      {/* Mobile Spotify Toggle Button */}
      <button
        className="fixed bottom-4 right-4 z-40 sm:hidden w-12 h-12 rounded-full bg-gradient-to-tr from-[#14d1ff] to-blue-600 text-white shadow-[0_8px_24px_rgba(20,209,255,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border border-[#14d1ff]/50"
        onClick={() => setIsSpotifyOpen(!isSpotifyOpen)}
        aria-label="Toggle Spotify Activity"
      >
        <span className="material-symbols-outlined text-2xl">
          {isSpotifyOpen ? 'close' : 'headphones'}
        </span>
      </button>

      {/* Komponen SpotifyCurrentTrack */}
      <div
        className={`fixed right-0 transition-all duration-500 w-[290px] sm:w-full sm:max-w-xs px-2 z-50 
          bottom-20 sm:bottom-[-130px]
          ${isSpotifyOpen ? 'opacity-100 pointer-events-auto translate-y-0 scale-100' : 'opacity-0 pointer-events-none translate-y-10 scale-95'} 
          sm:opacity-100 sm:pointer-events-auto sm:translate-y-0 sm:scale-100 sm:hover:bottom-4`}
      >
        <SpotifyCurrentTrack />
      </div>
    </>
  );
}
