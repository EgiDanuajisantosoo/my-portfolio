export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import SuccessAlert from "@/components/SuccessAlert";

type SearchParams = { q?: string };
// open popup modal sukses


async function getAnime(q: string) {
  const res = await fetch(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&sfw=true`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error("Failed to fetch anime data");
  const data = await res.json();
  return data.data;
}

export async function addAnime(formData: FormData) {
  "use server";
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
    }
  );

  const mal_id = Number(formData.get("mal_id"));
  const { count, error: checkError } = await supabase
    .from("hobbies")
    .select("id", { count: "exact", head: true })
    .eq("type_hobbies", "anime")
    .eq("mal_id", mal_id);

  if (checkError) {
    console.error("Supabase Check Error:", checkError);
    throw new Error("Gagal memeriksa duplikasi data");
  }

  if ((count ?? 0) > 0) {
    console.log("Data duplikat, tidak disimpan:", { type_hobbies: "anime", mal_id });
    redirect("/rec/anime?success=0&duplicate=1");
  }

  const data = {
    type_hobbies: "anime",
    type: "request",
    anonymous: formData.get("anonymous") || null,

    mal_id,
    title: String(formData.get("title")),
    image: String(formData.get("image")),

    score: formData.get("score") ? Number(formData.get("score")) : null,
    year: formData.get("year") ? Number(formData.get("year")) : null,

    url: String(formData.get("url")),
    genre: String(formData.get("genre") ?? ""),
  };

  console.log("Data ready to insert:", data);

  const { error } = await supabase.from("hobbies").insert(data);

  // Antisipasi balapan atau constraint unik di DB
  if (error) {
    if ((error as any).code === "23505") {
      console.warn("Unique violation, data sudah ada:", { type_hobbies: "anime", mal_id });
      redirect("/rec/anime?success=0&duplicate=1");
    }
    console.error("Supabase Insert Error:", error);
    throw new Error("Gagal menambahkan data ke tabel hobbies");
  }

  console.log("Berhasil disimpan ke Supabase");
  redirect("/rec/anime?success=1");
}

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params?.q?.trim() || "naruto";
  let animeList: any[] = [];

  try {
    animeList = await getAnime(query);
  } catch {
    animeList = [];
  }

  return (
    <>
      <SuccessAlert />
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
        action="/rec/anime"
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
                  {/* Modal toggle (CSS-only, no client JS) */}
                  <input id={`modal-${anime.mal_id}`} type="checkbox" className="peer hidden" />

                  <label
                    htmlFor={`modal-${anime.mal_id}`}
                    className="w-full h-10 text-xs bg-blue-600 hover:bg-blue-500 text-white 
                      rounded-lg font-medium mt-3 transition-all active:scale-[0.97] cursor-pointer 
                      inline-flex items-center justify-center"
                  >
                    Tambah
                  </label>

                  {/* Popup modal */}
                    <div className="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 p-4 peer-checked:flex">
                    {/* Click backdrop to close */}
                    <label htmlFor={`modal-${anime.mal_id}`} className="absolute inset-0 cursor-pointer" />

                    <div className="relative z-10 w-full max-w-md rounded-xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
                      <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                        <h3 className="text-white font-semibold leading-tight">{anime.title}</h3>
                        <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                          {genreString || "-"}
                        </p>
                        </div>
                        <label
                        htmlFor={`modal-${anime.mal_id}`}
                        className="text-gray-400 hover:text-white cursor-pointer px-2 text-lg leading-none"
                        >
                        ✕
                        </label>
                      </div>
                      </div>

                      <form action={addAnime} className="mt-4 space-y-3">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <label className="block text-xs text-gray-300 mb-1">
                        Nama / alias (opsional)
                        </label>
                        <input
                        type="text"
                        name="anonymous"
                        placeholder="Masukkan nama atau alias"
                        className="w-full text-sm bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                        Jika dikosongkan, akan disimpan tanpa nama.
                        </p>
                      </div>

                      <input type="hidden" name="mal_id" value={anime.mal_id} />
                      <input type="hidden" name="title" value={anime.title} />
                      <input type="hidden" name="image" value={anime.images.jpg.image_url} />
                      <input type="hidden" name="score" value={anime.score ?? ""} />
                      <input type="hidden" name="year" value={anime.year ?? ""} />
                      <input type="hidden" name="url" value={anime.url} />
                      <input type="hidden" name="genre" value={genreString} />

                      <div className="flex gap-3">
                        {/* Submit will trigger a server action and re-render the page,
                          resetting the checkbox state so the modal closes on success */}
                        <button
                        type="submit"
                        className="flex-1 w-full h-10 text-xs bg-green-600 hover:bg-green-500 text-white 
                        rounded-lg font-medium transition-all active:scale-[0.97] hover:cursor-pointer"
                        >
                        Simpan
                        </button>

                        <label
                        htmlFor={`modal-${anime.mal_id}`}
                        className="flex-1 h-10 text-xs bg-gray-700 hover:bg-gray-600 text-white 
                        rounded-lg font-medium transition-all active:scale-[0.97] cursor-pointer 
                        inline-flex items-center justify-center"
                        >
                        Batal
                        </label>
                      </div>
                      </form>
                    </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
