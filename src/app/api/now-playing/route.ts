import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('https://api.lanyard.rest/v1/users/688864050989367357', {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ isPlaying: false, error: 'Gagal mengambil data dari Lanyard' });
    }

    const json = await res.json();
    const data = json.data;

    // Status Discord
    const discordStatus = data?.discord_status || 'offline';
    const discordUser = data?.discord_user || null;

    if (data?.listening_to_spotify && data?.spotify) {
      const spotify = data.spotify;
      const start = spotify.timestamps?.start || Date.now();
      const end = spotify.timestamps?.end || Date.now();
      const duration_ms = end - start;
      const progress_ms = Math.max(0, Date.now() - start);

      return NextResponse.json({
        isPlaying: true,
        name: spotify.song,
        artists: [spotify.artist],
        album: {
          images: [{ url: spotify.album_art_url }]
        },
        progress_ms: Math.min(progress_ms, duration_ms),
        duration_ms,
        songUrl: `https://open.spotify.com/track/${spotify.track_id}`,
        discord_status: discordStatus,
        discord_user: discordUser,
        activities: data?.activities || [],
      });
    }

    return NextResponse.json({
      isPlaying: false,
      discord_status: discordStatus,
      discord_user: discordUser,
      activities: data?.activities || [],
    });
  } catch (error: any) {
    console.error('[Lanyard API Error]', error);
    return NextResponse.json({ isPlaying: false, error: error.message });
  }
}
