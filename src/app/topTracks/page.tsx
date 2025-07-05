"use client";

import React, { useEffect, useState } from "react";

type Track = {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[]; name: string };
    external_urls: { spotify: string };
};

type ApiResponse = {
    items: Track[];
};

export default function TopTracksPage() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTopTracks() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/top-items?type=tracks&time_range=medium_term&limit=10");
                const contentType = res.headers.get("content-type");
                if (!res.ok) {
                    let errMsg = "Failed to fetch";
                    if (contentType && contentType.includes("application/json")) {
                        const err = await res.json();
                        errMsg = err.error || errMsg;
                    } else {
                        errMsg = await res.text();
                    }
                    throw new Error(errMsg);
                }
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Invalid response from server");
                }
                const data: ApiResponse = await res.json();
                setTracks(data.items);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchTopTracks();
    }, []);

    if (loading) return <div>Loading top tracks...</div>;
    if (error) return <div>Error: {error}</div>;

    if (!tracks.length) {
        return <div>No top tracks found.</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">My Top Spotify Tracks</h1>
            <ul className="space-y-4">
                {tracks.map((track, idx) => {
                    // Ambil gambar album, jika tidak ada tampilkan placeholder
                    const albumImage =
                        track.album.images[1]?.url ||
                        track.album.images[0]?.url ||
                        "https://via.placeholder.com/64?text=No+Image";
                    return (
                        <li key={track.id} className="flex items-center space-x-4">
                            <span className="text-lg font-semibold">{idx + 1}.</span>
                            <img
                                src={albumImage}
                                alt={track.name}
                                className="w-16 h-16 rounded bg-gray-200 object-cover"
                            />
                            <div>
                                <a
                                    href={track.external_urls.spotify}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    {track.name}
                                </a>
                                <div className="text-gray-600">
                                    {track.artists.map((a) => a.name).join(", ")} &mdash; {track.album.name}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
