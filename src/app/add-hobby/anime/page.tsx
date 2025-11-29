export const dynamic = "force-dynamic";
import { addAnime } from "./actions";

type SearchParams = { q?: string };

async function getAnime(q: string) {
  const res = await fetch(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&sfw=true`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error("Failed to fetch anime data");
  const data = await res.json();
  return data.data;
}

export default async function AnimePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = searchParams.q?.trim() || "naruto";
  let animeList: any[] = [];

  try {
    animeList = await getAnime(query);
  } catch {
    animeList = [];
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Hasil Anime
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Cari anime favoritmu dan tambahkan ke daftar hobi.
          </p>
        </div>

        <a
          href="/"
          className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
        >
          Kembali
        </a>
      </div>

      {/* SEARCH FORM */}
      <form
        action="/add-hobby/anime"
        className="mb-8 flex gap-3 items-center backdrop-blur-sm p-3 rounded-xl bg-white/5 border border-white/10"
      >
        <div className="relative flex-1">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari anime (Naruto, One Piece, dan lainnya...)"
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

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all active:scale-95"
        >
          Cari
        </button>
      </form>

      {/* EMPTY STATE */}
      {animeList.length === 0 ? (
        <div className="border border-dashed rounded-xl p-10 text-center text-gray-400 bg-white/5 backdrop-blur-sm">
          <p className="font-medium text-white">Tidak ada hasil untuk "{query}".</p>
          <p className="text-sm mt-1">Coba kata kunci lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {animeList.map((anime) => {
            // genre dari Jikan: anime.genres = [{name: "Action"}, ...]
            const genreString = (anime.genres ?? [])
              .map((g: any) => g.name)
              .join(", ");

            return (
              <div
                key={anime.mal_id}
                className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 
              backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 
              flex flex-col"
              >
                <a
                  href={anime.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-[3/4] bg-black/20 overflow-hidden"
                >
                  <img
                    src={anime.images.jpg.image_url}
                    alt={anime.title}
                    className="w-full h-full object-cover group-hover:scale-[1.05] 
                  transition-transform duration-300"
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

                  {/* Genre (opsional, tampilkan juga) */}
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2 min-h-[32px]">
                    {genreString ? `Genre: ${genreString}` : ""}
                  </p>

                  <div className="flex-1"></div>

                  {/* Button */}
                  <form action={addAnime}>
                    <input type="hidden" name="mal_id" value={anime.mal_id} />
                    <input type="hidden" name="title" value={anime.title} />
                    <input type="hidden" name="image" value={anime.images.jpg.image_url} />
                    <input type="hidden" name="score" value={anime.score ?? ""} />
                    <input type="hidden" name="type" value={anime.type ?? ""} />
                    <input type="hidden" name="year" value={anime.year ?? ""} />
                    <input type="hidden" name="url" value={anime.url} />

                    {/* GENRE DIKIRIM KE SERVER ACTION */}
                    <input type="hidden" name="genre" value={genreString} />

                    <button
                      type="submit"
                      className="w-full h-10 text-xs bg-blue-600 hover:bg-blue-500 text-white 
                    rounded-lg font-medium mt-3 transition-all active:scale-[0.97] hover:cursor-pointer"
                    >
                      Tambah
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
