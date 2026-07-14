export const dynamic = "force-dynamic";
import { addAnime } from "./actions";

async function getAnime(q: string, source: string) {
  if (source === "jikan") {
    const res = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&sfw=true`,
      { 
        next: { revalidate: 0 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );
    if (!res.ok) {
      let errMsg = `Jikan API Error ${res.status}`;
      try {
        const errData = await res.json();
        if (errData.message) errMsg += `: ${errData.message}`;
      } catch (_) {}
      throw new Error(errMsg);
    }
    const data = await res.json();
    return data.data.map((a: any) => ({
      mal_id: a.mal_id,
      title: a.title,
      image_url: a.images?.jpg?.image_url || '/placeholder.jpg',
      score: a.score,
      type: a.type,
      year: a.year,
      genreString: (a.genres ?? []).map((g: any) => g.name).join(", "),
      url: a.url,
      source_name: "Jikan (MAL)"
    }));
  }
  
  if (source === "anilist") {
    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 12) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title { romaji }
            coverImage { large }
            startDate { year }
            averageScore
            genres
            siteUrl
            format
          }
        }
      }
    `;
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { search: q } }),
      next: { revalidate: 0 }
    });
    
    if (!res.ok) {
      throw new Error(`AniList API Error ${res.status}`);
    }
    
    const data = await res.json();
    return data.data.Page.media.map((a: any) => ({
      mal_id: a.id,
      title: a.title.romaji,
      image_url: a.coverImage?.large || '/placeholder.jpg',
      score: a.averageScore ? (a.averageScore / 10).toFixed(2) : null,
      type: a.format || "Anime",
      year: a.startDate?.year || null,
      genreString: a.genres?.join(", ") || "",
      url: a.siteUrl,
      source_name: "AniList"
    }));
  }
  
  return [];
}

export default async function AnimePage({ searchParams }: any) {
  const params = await searchParams;
  const query = params?.q?.trim() || "";
  const source = params?.source === "anilist" ? "anilist" : "jikan";

  let animeList: any[] = [];
  let errorMsg = "";
  
  if (query) {
    try {
      animeList = await getAnime(query, source);
    } catch (e: any) {
      console.error("Fetch Anime Error:", e);
      animeList = [];
      errorMsg = e.message;
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto pt-32 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Pencarian Anime
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Cari anime favoritmu menggunakan {source === "jikan" ? "Jikan (MAL)" : "AniList"}.
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <a
            href="/edit/anime"
            className="text-sm text-green-400 hover:text-green-300 underline underline-offset-4"
          >
            Kelola Koleksi
          </a>
          <a
            href="/mylist/anime"
            className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            Kembali
          </a>
        </div>
      </div>

      {/* SEARCH FORM */}
      <form
        action="/add-hobby/anime"
        className="mb-8 flex flex-col sm:flex-row gap-3 items-center backdrop-blur-sm p-3 rounded-xl bg-white/5 border border-white/10"
      >
        <div className="relative flex-1 w-full">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari anime (contoh: Naruto, Bleach...)"
            className="border border-white/10 bg-white/10 text-white rounded-lg pl-11 pr-3 py-2.5 w-full
        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>

        {/* Source Switcher */}
        <div className="flex bg-white/10 p-1 rounded-lg border border-white/10 w-full sm:w-auto">
          <label className="flex-1 sm:flex-none cursor-pointer">
            <input type="radio" name="source" value="jikan" defaultChecked={source === "jikan"} className="peer hidden" />
            <div className="px-4 py-1.5 text-xs text-center rounded-md transition-colors text-gray-400 hover:text-white peer-checked:bg-blue-600 peer-checked:text-white peer-checked:font-medium">
              Jikan (MAL)
            </div>
          </label>
          <label className="flex-1 sm:flex-none cursor-pointer">
            <input type="radio" name="source" value="anilist" defaultChecked={source === "anilist"} className="peer hidden" />
            <div className="px-4 py-1.5 text-xs text-center rounded-md transition-colors text-gray-400 hover:text-white peer-checked:bg-blue-600 peer-checked:text-white peer-checked:font-medium">
              AniList API
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 w-full sm:w-auto text-white px-5 py-2.5 rounded-lg font-medium transition-all active:scale-95"
        >
          Cari
        </button>
      </form>

      {/* RENDER LIST ANIME */}
      {animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {animeList.map((anime) => {
            return (
              <div
                key={anime.mal_id}
                className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 
              backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 
              flex flex-col relative"
              >
                {/* Source Badge */}
                <div className="absolute top-2 left-2 z-10">
                   <span className="bg-black/60 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full border border-white/10">
                     via {anime.source_name}
                   </span>
                </div>

                <a
                  href={anime.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-[3/4] bg-black/20 overflow-hidden relative"
                >
                  <img
                    src={anime.image_url}
                    alt={anime.title}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                    loading="lazy"
                  />
                </a>

                {/* CONTENT */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Title */}
                  <h2 className="font-semibold text-sm text-white line-clamp-2 min-h-[40px]">
                    {anime.title}
                  </h2>

                  {/* Score + Type */}
                  <div className="flex items-center justify-between text-xs text-gray-300 mt-2">
                    <span className="inline-flex items-center gap-1">
                      ⭐ {anime.score ?? "N/A"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20">
                      {anime.type ?? "Anime"}
                    </span>
                  </div>

                  {/* Tahun */}
                  <p className="text-xs text-gray-400 mt-1 min-h-[16px]">
                    {anime.year ? `Tahun: ${anime.year}` : ""}
                  </p>

                  {/* Genre */}
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2 min-h-[32px]">
                    {anime.genreString ? `Genre: ${anime.genreString}` : ""}
                  </p>

                  <div className="flex-1"></div>

                  {/* Button */}
                  <form action={addAnime}>
                    <input type="hidden" name="mal_id" value={anime.mal_id} />
                    <input type="hidden" name="title" value={anime.title} />
                    <input type="hidden" name="image" value={anime.image_url} />
                    <input type="hidden" name="score" value={anime.score ?? ""} />
                    <input type="hidden" name="type" value={anime.type ?? ""} />
                    <input type="hidden" name="year" value={anime.year ?? ""} />
                    <input type="hidden" name="url" value={anime.url} />
                    <input type="hidden" name="genre" value={anime.genreString} />

                    <button
                      type="submit"
                      className="w-full h-10 text-xs bg-blue-600 hover:bg-blue-500 text-white 
                    rounded-lg font-medium mt-4 transition-all active:scale-[0.97] hover:cursor-pointer"
                    >
                      Tambah
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {/* EMPTY STATE */}
          <div className="border border-dashed rounded-xl p-10 text-center text-gray-400 bg-white/5 backdrop-blur-sm border-white/20 mb-10">
            {query ? (
              <>
                <p className="font-medium text-white mb-2">Anime "{query}" tidak ditemukan di {source === "jikan" ? "Jikan (MAL)" : "AniList"}.</p>
                {errorMsg && <p className="text-xs text-red-400 mb-4">{errorMsg}</p>}
                
                {source === "jikan" ? (
                  <a href={`/add-hobby/anime?q=${encodeURIComponent(query)}&source=anilist`} className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-500/30">
                    <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                    Coba cari di AniList API
                  </a>
                ) : (
                  <a href={`/add-hobby/anime?q=${encodeURIComponent(query)}&source=jikan`} className="inline-flex items-center gap-2 bg-green-600/20 text-green-400 hover:bg-green-600/40 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-green-500/30">
                    <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                    Coba cari di Jikan (MAL)
                  </a>
                )}
              </>
            ) : (
              <>
                <p className="font-medium text-white">Cari Anime Favorit Anda</p>
                <p className="text-sm mt-1">Ketik judul anime di kolom pencarian di atas.</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
