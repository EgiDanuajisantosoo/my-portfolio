import useSWR from 'swr';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SpotifyIcon = () => (
  <svg role="img" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#1DB954" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.903 17.51c-.22.359-.71.484-1.07.264-2.92-1.78-6.59-2.18-10.94-.99a.803.803 0 0 1-.92-.78.803.803 0 0 1 .78-.92c4.71-1.28 8.75-.81 11.95 1.14.36.22.48.71.26 1.07v-.01zm1.2-3.13c-.26.44-1.03.62-1.47.36-3.23-1.95-8.23-2.5-12.04-1.38a1 1 0 0 1-1.1-1.02 1 1 0 0 1 1.02-1.1c4.21-1.23 9.61-.61 13.24 1.58.44.26.62 1.03.35 1.47l-.01.09zm.1-3.36C15.21 8.31 9.72 8.13 5.61 9.31a1.25 1.25 0 0 1-1.38-1.22c0-.68.55-1.23 1.23-1.38 4.56-1.29 10.58-1.08 14.62 1.83.52.37.73 1.18.36 1.7-.36.52-1.18.73-1.7.36z" />
  </svg>
);

const DiscordIcon = () => (
  <svg role="img" width="20" height="20" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
    <path fill="#5865F2" d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,7.06-11.51A68.08,68.08,0,0,1,28.4,79.52a51.62,51.62,0,0,0,2.54-2c21.84,10.07,45.48,10.07,67,0a51.62,51.62,0,0,0,2.54,2,68.08,68.08,0,0,1-10.66,5.33,77.7,77.7,0,0,0,7.06,11.51,105.73,105.73,0,0,0,31-18.83C129,54.65,123.5,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
  </svg>
);

const formatTime = (ms: number) => {
  if (!ms || ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SpotifyCurrentTrack() {
  const { data, error } = useSWR('/api/now-playing', fetcher, {
    refreshInterval: 2000,
  });

  const pathname = usePathname();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(data?.progress_ms ?? 0);
  }, [data]);

  // Incremen progres di sisi klien agar pergerakannya mulus
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (data?.isPlaying && progress < data.duration_ms) {
      interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 1000, data.duration_ms));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [data?.isPlaying, data?.duration_ms, progress]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'idle': return 'Idle / Away';
      case 'dnd': return 'Jangan Diganggu';
      default: return 'Offline';
    }
  };

  // Mengubah aset image dari Discord/Lanyard ke CDN URL
  const getAssetUrl = (applicationId: string, imageId: string) => {
    if (!imageId) return null;
    if (imageId.startsWith('mp:external/')) {
      const parts = imageId.split('mp:external/');
      if (parts[1]) {
        const subParts = parts[1].split('/');
        const url = subParts.slice(1).join('/');
        return `https://${url}`;
      }
    }
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${imageId}.png`;
  };

  if (error) {
    return (
      <div className="bg-[#0c1222] border border-gray-800 text-white rounded-xl p-4 w-full max-w-xs font-sans shadow-2xl">
        Gagal memuat aktivitas.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="bg-[#0c1222] border border-gray-800 text-white rounded-xl p-4 w-full max-w-xs font-sans shadow-2xl flex items-center justify-center min-h-[100px]">
        <div className="text-xs text-gray-400 animate-pulse">Loading Aktivitas...</div>
      </div>
    );
  }

  const clampedProgress = Math.min(progress, data.duration_ms ?? progress);
  const progressPercentage = data.isPlaying && data.duration_ms
    ? (clampedProgress / data.duration_ms) * 100
    : 0;

  const activities = data.activities || [];
  const filteredActivities = activities.filter((act: any) => act.name !== 'Spotify' && act.type !== 4);
  const customStatus = activities.find((act: any) => act.type === 4);

  const displayName = data.discord_user?.global_name || data.discord_user?.display_name || 'Egiii.';
  const username = data.discord_user?.username || 'egiii.';

  return (
    <div className="bg-[#0c1222] border border-gray-800 text-white rounded-xl p-4 w-full max-w-xs font-sans shadow-2xl transition-all duration-300 hover:border-blue-500/30 hover:shadow-blue-500/5">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800/40">
        <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${getStatusColor(data?.discord_status)}`}></span>
          <span>Aktivitas Discord</span>
        </div>
        
        {data.isPlaying ? (
          <a
            href={data?.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full hover:scale-105 transition-transform duration-200"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            <span className="text-[9px] text-green-400 font-semibold uppercase tracking-wider">Spotify</span>
          </a>
        ) : (
          <a
            href="https://discord.com/users/688864050989367357"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-200"
          >
            <DiscordIcon />
          </a>
        )}
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-shrink-0">
          {data.discord_user?.avatar ? (
            <img
              src={`https://cdn.discordapp.com/avatars/688864050989367357/${data.discord_user.avatar}.png`}
              alt="Discord Avatar"
              width={48}
              height={48}
              className="rounded-full w-12 h-12 border-2 border-gray-800 shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-300 border border-gray-700">
              E
            </div>
          )}
          <span className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-[#0c1222] ${getStatusColor(data?.discord_status)} shadow-lg`}></span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white truncate text-sm leading-tight">{displayName}</div>
          <div className="text-[10px] text-gray-400 truncate">@{username}</div>
          
          {customStatus && (
            <div className="text-[9px] text-gray-300 italic bg-gray-950/50 border border-gray-850/40 px-1.5 py-0.5 rounded mt-1 inline-flex items-center gap-1 max-w-full">
              {customStatus.emoji && <span>{customStatus.emoji.name}</span>}
              <span className="truncate">{customStatus.state}</span>
            </div>
          )}
        </div>
      </div>

      {data.isPlaying && (
        <div className="mt-3 border-t border-gray-800/60 pt-3 flex flex-col gap-3 bg-green-950/10 border border-green-900/10 rounded-lg p-2.5">
          <div className="flex gap-3 items-center">
            {data.album?.images?.[0]?.url && (
              <div className="relative flex-shrink-0">
                <img
                  src={data.album.images[0].url}
                  alt={data.name || 'Album Art'}
                  width={48}
                  height={48}
                  className="rounded-lg w-12 h-12 object-cover border border-gray-700/30 shadow-md"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-white truncate hover:text-green-400 transition-colors">
                <a href={data.songUrl} target="_blank" rel="noopener noreferrer">{data.name}</a>
              </div>
              <div className="text-[10px] text-gray-300 truncate">{data.artists?.join(', ')}</div>

              <div className="w-full bg-gray-800 rounded-full h-1 mt-2 overflow-hidden">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all duration-1000 linear shadow-[0_0_8px_#1db954]"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-gray-400 mt-1">
                <span>{formatTime(clampedProgress)}</span>
                <span>{formatTime(data.duration_ms)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredActivities.length > 0 && (
        <div className="mt-3 border-t border-gray-800/60 pt-3 flex flex-col gap-2.5">
          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Sedang Melakukan:</p>
          {filteredActivities.map((act: any, idx: number) => {
            const largeImageUrl = act.assets?.large_image ? getAssetUrl(act.application_id, act.assets.large_image) : null;
            const smallImageUrl = act.assets?.small_image ? getAssetUrl(act.application_id, act.assets.small_image) : null;

            return (
              <div key={idx} className="flex gap-2.5 items-center bg-gray-900/40 border border-gray-850/40 rounded-lg p-2 hover:border-gray-700/30 transition-all duration-200">
                {largeImageUrl ? (
                  <div className="relative flex-shrink-0">
                    <img
                      src={largeImageUrl}
                      alt={act.assets.large_text || act.name}
                      width={32}
                      height={32}
                      className="rounded w-8 h-8 object-cover border border-gray-850 bg-gray-900"
                    />
                    {smallImageUrl && (
                      <img
                        src={smallImageUrl}
                        alt={act.assets.small_text || ''}
                        width={12}
                        height={12}
                        className="absolute -bottom-1 -right-1 rounded-full w-3.5 h-3.5 border border-gray-900 bg-gray-900 shadow-md"
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded bg-gray-950/60 border border-gray-855 flex items-center justify-center text-xs font-bold text-gray-400">
                    🎮
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[11px] text-white truncate">{act.name}</div>
                  {act.details && <div className="text-[9px] text-gray-300 truncate mt-0.5">{act.details}</div>}
                  {act.state && <div className="text-[9px] text-gray-400 truncate mt-0.5">{act.state}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pathname === '/portfolio' && (
        <Link href="/topTracks" className="mt-4 block text-center text-xs text-gray-400 hover:text-green-400 transition-colors duration-200 border-t border-gray-800/60 pt-3">
          Lihat Lagu Yang Sering Diputar →
        </Link>
      )}
    </div>
  );
}