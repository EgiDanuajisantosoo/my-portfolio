"use client";

import { SpotifyCurrentTrack } from '@/components/SpotifyCurrentTrack';
import { AIChatBot } from '@/components/AIChatBot';
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



function FilterControls({
    filter,
    onFilterChange,
    timeRange,
    onTimeRangeChange,
    limit,
    onLimitChange,
}: FilterControlsProps) {
    const baseButtonClass = 'px-8 py-3 rounded-full font-label-md uppercase tracking-[2.5px] text-[14px] transition-all duration-300 transform hover:scale-105 border';
    const [limitInput, setLimitInput] = useState<string>(limit.toString());

    // Sinkronkan limit dari props saat berubah
    useEffect(() => {
        setLimitInput(limit.toString());
    }, [limit]);

    return (
        <div className="sticky top-0 z-50 w-full bg-background p-6 border-b border-outline shadow-none">
            {/* Mobile Dropdown */}
            <div className="flex flex-col gap-4 md:hidden mb-4">
                <select
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value as 'tracks' | 'artists')}
                    className="rounded-none bg-background text-on-primary p-3 border border-outline font-label-md uppercase tracking-[2px]"
                >
                    <option value="tracks">Top Tracks</option>
                    <option value="artists">Top Artists</option>
                </select>

                <select
                    value={timeRange}
                    onChange={(e) => onTimeRangeChange(e.target.value as 'short_term' | 'medium_term' | 'long_term')}
                    className="rounded-none bg-background text-on-primary p-3 border border-outline font-label-md uppercase tracking-[2px]"
                >
                    <option value="short_term">4 Minggu</option>
                    <option value="medium_term">6 Bulan</option>
                    <option value="long_term">1 Tahun</option>
                </select>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex flex-wrap items-center gap-6 justify-between">
                <div className="flex gap-4">
                    <button
                        onClick={() => onFilterChange('tracks')}
                        className={`${baseButtonClass} ${filter === 'tracks' ? 'border-primary bg-primary text-on-primary' : 'border-outline text-text-secondary hover:bg-primary hover:text-on-primary'}`}
                    >
                        Top Tracks
                    </button>
                    <button
                        onClick={() => onFilterChange('artists')}
                        className={`${baseButtonClass} ${filter === 'artists' ? 'border-primary bg-primary text-on-primary' : 'border-outline text-text-secondary hover:bg-primary hover:text-on-primary'}`}
                    >
                        Top Artists
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => onTimeRangeChange('short_term')}
                        className={`${baseButtonClass} ${timeRange === 'short_term' ? 'border-primary bg-primary text-on-primary' : 'border-outline text-text-secondary hover:bg-primary hover:text-on-primary'}`}
                    >
                        4 Minggu
                    </button>
                    <button
                        onClick={() => onTimeRangeChange('medium_term')}
                        className={`${baseButtonClass} ${timeRange === 'medium_term' ? 'border-primary bg-primary text-on-primary' : 'border-outline text-text-secondary hover:bg-primary hover:text-on-primary'}`}
                    >
                        6 Bulan
                    </button>
                    <button
                        onClick={() => onTimeRangeChange('long_term')}
                        className={`${baseButtonClass} ${timeRange === 'long_term' ? 'border-primary bg-primary text-on-primary' : 'border-outline text-text-secondary hover:bg-primary hover:text-on-primary'}`}
                    >
                        1 Tahun
                    </button>
                </div>
            </div>

            {/* Jumlah */}
            <div className="mt-6 flex items-center gap-4">
                <label htmlFor="limit-input" className="font-label-md uppercase tracking-[2px] text-[11px] text-text-secondary">Jumlah:</label>
                <input
                    id="limit-input"
                    type="number"
                    value={limitInput}
                    onChange={(e) => {
                        let raw = e.target.value;
                        if (/^0\d/.test(raw)) {
                            raw = raw.replace(/^0+/, '');
                        }
                        setLimitInput(raw);
                        const num = Number(raw);
                        if (!isNaN(num) && num >= 1 && num <= 50) {
                            onLimitChange(num);
                        }
                    }}
                    onBlur={() => {
                        const num = Number(limitInput);
                        if (isNaN(num) || num < 1) {
                            setLimitInput('1');
                            onLimitChange(1);
                        } else if (num > 50) {
                            setLimitInput('50');
                            onLimitChange(50);
                        }
                    }}
                    className="w-20 rounded-none border border-outline bg-background p-3 text-center text-on-primary font-body-md focus:outline-none focus:border-primary transition-colors"
                    min="1"
                    max="50"
                />
            </div>
        </div>
    );
}




// Komponen Item (tidak berubah)
// Komponen Item
const TrackItem = ({ track }: { track: Track }) => {
    const imageUrl = track.album?.images?.[0]?.url || 'https://place-hold.it/128x128?text=No+Image';
    const spotifyUrl = track.external_urls?.spotify || '#';
    const artistsList = Array.isArray(track.artists)
        ? track.artists.map((artist: any) => artist.name).join(', ')
        : 'Artis Tidak Dikenal';

    return (
        <li className="flex items-center gap-6 border-b border-outline p-4 transition-all duration-300 transform hover:scale-[1.01] hover:translate-x-1 hover:border-secondary group bg-background">
            <img src={imageUrl} alt={track.name} className="h-20 w-20 rounded-none object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="flex-1">
                <p className="font-display text-[20px] tracking-[1px] text-text-primary mb-1 uppercase group-hover:text-secondary group-hover:scale-105 origin-left inline-block transition-all duration-300">{track.name}</p>
                <p className="font-body-md text-text-secondary group-hover:text-secondary group-hover:scale-105 origin-left transition-all duration-300 block">{artistsList}</p>
                <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center font-label-md uppercase tracking-[2px] text-[11px] text-link hover:text-secondary transition-colors"
                >
                    Dengarkan Lagu <span className="material-symbols-outlined text-[14px] ml-1">arrow_forward</span>
                </a>
            </div>
        </li>
    );
};

const ArtistItem = ({ artist }: { artist: Artist }) => {
    const imageUrl = artist.images?.[0]?.url || 'https://place-hold.it/128x128?text=No+Image';
    const spotifyUrl = artist.external_urls?.spotify || '#';
    const genresList = Array.isArray(artist.genres)
        ? artist.genres.join(', ')
        : 'No Genre';

    return (
        <li className="flex items-center gap-6 border-b border-outline p-4 transition-all duration-300 transform hover:scale-[1.01] hover:translate-x-1 hover:border-secondary group bg-background">
            <img src={imageUrl} alt={artist.name} className="h-20 w-20 rounded-none object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="flex-1">
                <p className="font-display text-[20px] tracking-[1px] text-text-primary mb-1 uppercase group-hover:text-secondary group-hover:scale-105 origin-left inline-block transition-all duration-300">{artist.name}</p>
                <p className="font-body-md text-text-secondary capitalize group-hover:text-secondary group-hover:scale-105 origin-left transition-all duration-300 block">
                    {genresList}
                </p>
                <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center font-label-md uppercase tracking-[2px] text-[11px] text-link hover:text-secondary transition-colors"
                >
                    Lihat Artis <span className="material-symbols-outlined text-[14px] ml-1">arrow_forward</span>
                </a>
            </div>
        </li>
    );
};



export default function TopItemsPage() {
    const [data, setData] = useState<{ items: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastfmUsername, setLastfmUsername] = useState<string | null>(null);

    const [filter, setFilter] = useState<'tracks' | 'artists'>('tracks');
    const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
    const [limit, setLimit] = useState<number>(10);

    useEffect(() => {
        const match = document.cookie.match(/(^|;)\s*lastfm_username\s*=\s*([^;]+)/);
        if (match) {
            setLastfmUsername(decodeURIComponent(match[2]));
        }
    }, []);

    useEffect(() => {
        let active = true;

        async function fetchTopItems() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/top-tracks?type=${filter}&time_range=${timeRange}&limit=${limit}`);
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || errData.details || 'Gagal mengambil data');
                }
                const result = await res.json();
                if (active) {
                    setData(result);
                }
            } catch (err: any) {
                if (active) {
                    setError(err.message);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }
        fetchTopItems();

        return () => {
            active = false;
        };
    }, [filter, timeRange, limit, lastfmUsername]); // <-- Dependensi yang bersih

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
        <main className='bg-background text-on-primary min-h-screen pt-32 pb-32'>
            <div className="w-full max-w-5xl mx-auto px-4 md:px-margin-desktop">
                {/* Back to Portfolio Link */}
                <div className="mb-12">
                    <a
                        href="/portfolio"
                        className="inline-flex items-center gap-2 font-label-md uppercase tracking-[2px] text-[11px] text-text-secondary hover:text-primary transition-colors group"
                    >
                        <span className="material-symbols-outlined text-[16px] transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span>Kembali ke Portfolio</span>
                    </a>
                </div>

                <div className="flex flex-col gap-6 mb-16 border-b border-outline pb-8">
                    <div>
                        <h1 className="font-display text-[48px] uppercase tracking-[3px] text-primary flex flex-wrap items-center gap-4 mb-4">
                            <span>Top Musik Saya</span>
                            <span className="text-[11px] font-label-md uppercase tracking-[2px] border border-outline-variant text-text-secondary px-4 py-1 rounded-none">dari Last.fm (17/05/2026)</span>
                        </h1>
                        <p className="font-body-md text-text-secondary">
                            {lastfmUsername
                                ? `Menampilkan lagu & artis teratas untuk akun Last.fm: ${lastfmUsername}`
                                : 'List artis dan lagu yang paling sering diputar.'
                            }
                        </p>
                    </div>
                </div>

                <FilterControls
                    filter={filter} onFilterChange={handleFilterChange}
                    timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange}
                    limit={limit} onLimitChange={setLimit} // `limit` tidak perlu mereset data
                />


                {loading && <p className="text-center text-text-secondary font-label-md uppercase tracking-[2px] py-16">Loading...</p>}
                {error && <p className="text-center text-warning font-label-md uppercase tracking-[2px] py-16">Error: {error}</p>}

                {!loading && data && (
                    <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                        {data.items?.map((item) =>
                            filter === 'tracks'
                                ? <TrackItem key={item.id} track={item} />
                                : <ArtistItem key={item.id} artist={item} />
                        )}
                    </ul>
                )}
                {/* Komponen SpotifyCurrentTrack */}
                <div
                    className="fixed left-1/2 transform -translate-x-1/2 transition-all duration-300 w-full max-w-xs px-2 bottom-[-90px] sm:left-auto sm:right-0 sm:bottom-[-90px] sm:translate-x-0"
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
            <AIChatBot />
            </div>
        </main>
    );
}