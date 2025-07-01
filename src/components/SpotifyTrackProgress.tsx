'use client';

import { useEffect, useState } from 'react';

export default function SpotifyTrackProgress() {
  const [progress, setProgress] = useState(0); // ms
  const [duration, setDuration] = useState(0); // ms
  const [isPlaying, setIsPlaying] = useState(false);

  // Untuk update progres secara real-time
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/spotify-token'); // Ganti jika perlu
      const { access_token } = await res.json();

      const trackRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (trackRes.status === 200) {
        const data = await trackRes.json();
        setProgress(data.progress_ms);
        setDuration(data.item.duration_ms);
        setIsPlaying(data.is_playing);
      }
    };

    fetchData();
  }, []);

  // Realtime progress update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev + 1000 <= duration ? prev + 1000 : duration));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div>
      <div>Durasi: {formatTime(duration)}</div>
      <div>Progress: {formatTime(progress)}</div>
      <progress value={progress} max={duration} style={{ width: '100%' }} />
    </div>
  );
}
