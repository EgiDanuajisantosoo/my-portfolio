import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const trackPlaceholders = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', // stage lights
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop', // dj deck
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop', // mic
  'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=200&auto=format&fit=crop', // abstract music
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=200&auto=format&fit=crop', // concert crowd
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=200&auto=format&fit=crop', // sheet music
  'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=200&auto=format&fit=crop', // record player
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=200&auto=format&fit=crop', // retro radio
];

const artistPlaceholders = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=200&auto=format&fit=crop', // singer
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=200&auto=format&fit=crop', // performance
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=200&auto=format&fit=crop', // band on stage
  'https://images.unsplash.com/photo-1482440308425-276ad0f28b19?q=80&w=200&auto=format&fit=crop', // guitar player
  'https://images.unsplash.com/photo-1517230878791-4d28214057c2?q=80&w=200&auto=format&fit=crop', // mic close up
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=200&auto=format&fit=crop', // keyboard player
];

function getDeterministicImage(name: string, isArtist: boolean): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % (isArtist ? artistPlaceholders.length : trackPlaceholders.length);
  return isArtist ? artistPlaceholders[index] : trackPlaceholders[index];
}

function resolveImage(rawUrl: string | undefined, name: string, isArtist: boolean): string {
  if (!rawUrl || rawUrl.trim() === '' || rawUrl.includes('2a96cbd8b46e442fc41c2b86b821562f.png')) {
    return getDeterministicImage(name, isArtist);
  }
  return rawUrl;
}

async function enhanceTrackWithDeezer(track: any) {
  const artistName = track.artist?.name || '';
  const trackName = track.name;

  const query = `${trackName} ${artistName}`;
  const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`;

  let imageUrl = undefined;
  let trackId = track.mbid || `${trackName}-${artistName}`.replace(/\s+/g, '-');

  try {
    const res = await fetch(deezerUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const deezerTrack = data.data?.[0];
      if (deezerTrack && deezerTrack.album?.cover_medium) {
        imageUrl = deezerTrack.album.cover_medium;
        trackId = `deezer-${deezerTrack.id}`;
      }
    }
  } catch (err) {
    console.error(`[Deezer Track Search Error] ${query}:`, err);
  }

  if (!imageUrl) {
    const rawUrl = track.image?.find((img: any) => img.size === 'extralarge' || img.size === 'large')?.['#text'];
    imageUrl = resolveImage(rawUrl, trackName, false);
  }

  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(trackName + ' ' + artistName)}`;

  return {
    id: trackId,
    name: trackName,
    artists: [{ name: artistName || 'Artis Tidak Dikenal' }],
    album: {
      images: [{ url: imageUrl }]
    },
    external_urls: {
      spotify: spotifySearchUrl
    }
  };
}

async function enhanceArtistWithDeezer(artist: any) {
  const artistName = artist.name;
  const deezerUrl = `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=1`;

  let imageUrl = undefined;
  let artistId = artist.mbid || artistName.replace(/\s+/g, '-');
  let genres = ['Last.fm Artist'];

  try {
    const res = await fetch(deezerUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const deezerArtist = data.data?.[0];
      if (deezerArtist && deezerArtist.picture_medium) {
        imageUrl = deezerArtist.picture_medium;
        artistId = `deezer-${deezerArtist.id}`;
      }
    }
  } catch (err) {
    console.error(`[Deezer Artist Search Error] ${artistName}:`, err);
  }

  if (!imageUrl) {
    const rawUrl = artist.image?.find((img: any) => img.size === 'extralarge' || img.size === 'large')?.['#text'];
    imageUrl = resolveImage(rawUrl, artistName, true);
  }

  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(artistName)}`;

  return {
    id: artistId,
    name: artistName,
    genres: genres,
    images: [{ url: imageUrl }],
    external_urls: {
      spotify: spotifySearchUrl
    }
  };
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const loggedInUser = cookieStore.get('lastfm_username')?.value;
  const defaultUser = process.env.LASTFM_USERNAME || 'egiii_';
  const username = loggedInUser || defaultUser;

  const apiKey = process.env.LASTFM_API_KEY || '537f8f94d9302ca1691ab1a12cc9318b';

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') ?? 'tracks';
    const time_range = searchParams.get('time_range') ?? 'medium_term';
    const limit = searchParams.get('limit') ?? '10';

    const limitNum = Math.min(Math.max(Number(limit), 1), 50);

    const periodMap: Record<string, string> = {
      short_term: '7day',
      medium_term: '6month',
      long_term: 'overall',
    };
    const period = periodMap[time_range] || '6month';

    const method = type === 'artists' ? 'user.gettopartists' : 'user.gettoptracks';

    const lastfmUrl = `http://ws.audioscrobbler.com/2.0/?method=${method}&user=${username}&api_key=${apiKey}&period=${period}&limit=${limitNum}&format=json`;

    const response = await fetch(lastfmUrl, { cache: 'no-store' });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Gagal mengambil data dari Last.fm', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    let items: any[] = [];

    if (type === 'artists' && data.topartists?.artist) {
      const rawArtists = Array.isArray(data.topartists.artist)
        ? data.topartists.artist
        : [data.topartists.artist];
      items = await Promise.all(rawArtists.map(enhanceArtistWithDeezer));
    } else if (type === 'tracks' && data.toptracks?.track) {
      const rawTracks = Array.isArray(data.toptracks.track)
        ? data.toptracks.track
        : [data.toptracks.track];
      items = await Promise.all(rawTracks.map(enhanceTrackWithDeezer));
    }

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('[Last.fm Top Items Error]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data dari Last.fm', details: error.message },
      { status: 500 }
    );
  }
}
