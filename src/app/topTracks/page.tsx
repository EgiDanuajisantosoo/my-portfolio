"use client";

import { SpotifyCurrentTrack } from '@/components/SpotifyCurrentTrack';
import React, { useState, useEffect } from 'react';

// Definisikan tipe data di sini
type Track = any;
type Artist = any;

// Komponen FilterControls sekarang lebih sederhana
type FilterControlsProps = {
    filter: 'tracks' | 'artists';
    onFilterChange: (filter: 'tracks' | 'artists') => void;
    timeRange: 'short_term' | 'medium_term' | 'long_term';
    onTimeRangeChange: (timeRange: 'short_term' | 'medium_term' | 'long_term') => void;
    limit: number;
    onLimitChange: (limit: number) => void;
};



function FilterControls({ filter, onFilterChange, timeRange, onTimeRangeChange, limit, onLimitChange }: FilterControlsProps) {
    const baseButtonClass = 'px-4 py-2 rounded-full font-semibold transition-colors';

    return (
        <div className="sticky top-0 z-50 w-full bg-neutral-800/90 backdrop-blur-md p-4 border-b border-neutral-700 shadow">
            {/* Mobile Dropdown */}
            <div className="flex flex-col gap-4 md:hidden">
                <select
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value as 'tracks' | 'artists')}
                    className="rounded bg-neutral-700 text-white p-2 border border-neutral-600"
                >
                    <option value="tracks">Top Tracks</option>
                    <option value="artists">Top Artists</option>
                </select>

                <select
                    value={timeRange}
                    onChange={(e) => onTimeRangeChange(e.target.value as 'short_term' | 'medium_term' | 'long_term')}
                    className="rounded bg-neutral-700 text-white p-2 border border-neutral-600"
                >
                    <option value="short_term">4 Minggu</option>
                    <option value="medium_term">6 Bulan</option>
                    <option value="long_term">1 tahun</option>
                </select>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex flex-wrap items-center gap-6 justify-between">
                <div className="flex gap-3">
                    <button onClick={() => onFilterChange('tracks')} className={`${baseButtonClass} ${filter === 'tracks' ? 'bg-green-500' : 'bg-neutral-600 hover:bg-neutral-500'}`}>Top Tracks</button>
                    <button onClick={() => onFilterChange('artists')} className={`${baseButtonClass} ${filter === 'artists' ? 'bg-green-500' : 'bg-neutral-600 hover:bg-neutral-500'}`}>Top Artists</button>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => onTimeRangeChange('short_term')} className={`${baseButtonClass} ${timeRange === 'short_term' ? 'bg-green-500' : 'bg-neutral-600 hover:bg-neutral-500'}`}>4 Minggu</button>
                    <button onClick={() => onTimeRangeChange('medium_term')} className={`${baseButtonClass} ${timeRange === 'medium_term' ? 'bg-green-500' : 'bg-neutral-600 hover:bg-neutral-500'}`}>6 Bulan</button>
                    <button onClick={() => onTimeRangeChange('long_term')} className={`${baseButtonClass} ${timeRange === 'long_term' ? 'bg-green-500' : 'bg-neutral-600 hover:bg-neutral-500'}`}>1 tahun</button>
                </div>
            </div>

            {/* Jumlah (Selalu tampil) */}
            <div className="mt-4 flex items-center gap-3">
                <label htmlFor="limit-input" className="text-sm text-neutral-400">Jumlah:</label>
                <input id="limit-input" type="number" value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} className="w-20 rounded border border-neutral-600 bg-neutral-700 p-2 text-center text-white" min="1" max="50" />
            </div>
        </div>
    );
}




// Komponen Item (tidak berubah)
// Komponen Item
const TrackItem = ({ track }: { track: Track }) => {
    const imageUrl = track.album?.images?.[0]?.url || 'https://place-hold.it/128x128?text=No+Image';
    const spotifyUrl = track.external_urls?.spotify || '#'; 
    return (
        <li className="flex items-center gap-4 rounded p-2 transition-colors hover:bg-neutral-800">
            <img src={imageUrl} alt={track.name} className="h-16 w-16 rounded object-cover bg-neutral-700" />
            <div>
                <p className="font-bold">{track.name}</p>
                <p className="text-sm text-neutral-400">{track.artists.map((artist: any) => artist.name).join(', ')}</p>
                <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-green-400 hover:underline"
                >
                    Dengarkan Lagu →
                </a>
            </div>
        </li>
    );
};

const ArtistItem = ({ artist }: { artist: Artist }) => {
    const imageUrl = artist.images?.[0]?.url || 'https://place-hold.it/128x128?text=No+Image';
    const spotifyUrl = artist.external_urls?.spotify || '#'; 

    return (
        <li className="flex items-center gap-4 rounded p-2 transition-colors hover:bg-neutral-800">
            <img src={imageUrl} alt={artist.name} className="h-16 w-16 rounded-full object-cover bg-neutral-700" />
            <div>
                <p className="font-bold">{artist.name}</p>
                <p className="text-sm capitalize text-neutral-400">
                    {artist.genres?.join(', ') || 'No Genre'}
                </p>
                <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-green-400 hover:underline"
                >
                    Lihat Artis →
                </a>
            </div>
        </li>
    );
};



export default function TopItemsPage() {
    const [data, setData] = useState<{ items: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filter, setFilter] = useState<'tracks' | 'artists'>('tracks');
    const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
    const [limit, setLimit] = useState<number>(10);

    useEffect(() => {
        async function fetchTopItems() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/top-tracks?type=${filter}&time_range=${timeRange}&limit=${limit}`);
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error?.message || 'Gagal mengambil data');
                }
                const result = await res.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchTopItems();
    }, [filter, timeRange, limit]); // <-- Dependensi yang bersih

    // Handler untuk mereset data saat filter utama berubah
    const handleFilterChange = (newFilter: 'tracks' | 'artists') => {
        setData(null); // Reset data untuk mencegah error render
        setFilter(newFilter);
    };

    const handleTimeRangeChange = (newTimeRange: 'short_term' | 'medium_term' | 'long_term') => {
        setData(null); // Reset data untuk mencegah error render
        setTimeRange(newTimeRange);
    };

    return (
        <main className='bg-[#0a0a0a] text-white'>
            <div className="w-full max-w-4xl mx-auto p-4">
                <h1 className="text-3xl font-bold">Top Spotify Saya</h1>
                <p className="text-neutral-400 mt-1">List artis dan lagu yang paling sering saya putar.</p>

                <FilterControls
                    filter={filter} onFilterChange={handleFilterChange}
                    timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange}
                    limit={limit} onLimitChange={setLimit} // `limit` tidak perlu mereset data
                />

                {loading && <p className="text-center text-neutral-400">Loading...</p>}
                {error && <p className="text-center text-red-500">Error: {error}</p>}

                {!loading && data && (
                    <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {data.items?.map((item) =>
                            filter === 'tracks'
                                ? <TrackItem key={item.id} track={item} />
                                : <ArtistItem key={item.id} artist={item} />
                        )}
                    </ul>
                )}
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
                    {/* Import komponen dari components/SpotifyCurrentTrack */}
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
            </div>
        </main>
    );
}