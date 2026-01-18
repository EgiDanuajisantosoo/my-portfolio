import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Hobby = {
    id: number;
    title: string;
    image?: string | null;
    url?: string | null;
    year?: number | null;
    score?: number | null;
    genre?: string[] | null;
    episodes?: number | null;
    status?: string | null;
    studio?: string | null;
    synopsis?: string | null;
    type_hobbies?: string | null;
    anonymous?: string | null;
    watching_status?: string | null;
};

const PAGE_SIZE = 10;
const REQUEST_TYPE = "request";
const FAVORITE_TYPE = "favorite";

const WATCHING_STATUS_OPTIONS = ["on-going", "selesai", "draft"];

export default async function AnimeHobbyList({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const params = await searchParams;

    const page = Math.max(1, Number(params.page ?? 1));

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const selectedStatus =
        params.status && params.status !== "all"
            ? params.status.trim()
            : undefined;


    // Favorites (Anime) with pagination + filter watching_status
    let favQuery = supabase
        .from("hobbies")
        .select("*", { count: "exact" })
        .eq("type_hobbies", "anime")
        .eq("type", FAVORITE_TYPE)
        .order("id", { ascending: false })
        .range(from, to);

    // filter watching_status jika dipilih
    if (selectedStatus && selectedStatus !== "all") {
        favQuery = favQuery.eq("watching_status", selectedStatus);
    }


    const { data: hobbies, error } = await favQuery;

    if (error) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                    Terjadi kesalahan saat mengambil data.
                </div>
            </div>
        );
    }

    // Requests (Anime)
    let reqQuery = supabase
        .from("hobbies")
        .select("*")
        .eq("type_hobbies", "anime")
        .eq("type", REQUEST_TYPE)
        .order("id", { ascending: false })
        .limit(10);

    // if (selectedStatus) {
    //     reqQuery = reqQuery.eq("watching_status", selectedStatus);
    // }

    const { data: requests } = await reqQuery;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                    <span>🎌</span>
                    <span>Anime Collection</span>
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Daftar Anime Saya
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                    Kumpulan anime yang sudah saya tonton.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                        href={`?page=1`}
                        className={`text-xs px-3 py-1 rounded-full border border-white/10 ${!selectedStatus ? "bg-white/15" : "hover:bg-white/10"
                            }`}
                    >
                        Semua
                    </a>
                    {WATCHING_STATUS_OPTIONS.map((st) => (
                        <a
                            key={st}
                            href={`?page=1&status=${encodeURIComponent(st)}`}
                            className={`text-xs px-3 py-1 rounded-full border border-white/10 ${selectedStatus === st ? "bg-white/15" : "hover:bg-white/10"
                                }`}
                        >
                            {st}
                        </a>
                    ))}
                </div>
            </div>

            {!hobbies || hobbies.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-white/5 grid place-items-center">
                        <span>📭</span>
                    </div>
                    <p className="text-sm text-gray-300">Belum ada anime yang disimpan.</p>
                    <p className="mt-1 text-xs text-gray-500">
                        {selectedStatus
                            ? `Tidak ada data dengan status "${selectedStatus}".`
                            : "Tambahkan anime untuk mulai mengisi daftar."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {(hobbies as Hobby[]).map((item) => (
                            <div
                                key={item.id}
                                className="group rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-white/2 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30"
                            >
                                <div className="relative">
                                    <div className="aspect-[4/5] w-full bg-neutral-800">
                                        <img
                                            src={item.image || "/placeholder.jpg"}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />

                                    <div className="absolute top-2 left-2 flex items-center gap-2">
                                        <span className="rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-[11px] text-white">
                                            {item.year ?? "—"}
                                        </span>
                                        <span className="rounded-full bg-yellow-400 text-black px-2 py-0.5 text-[11px] font-medium">
                                            ⭐ {item.score ?? "N/A"}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-gradient-to-t from-black/80 to-transparent">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {item.status && (
                                                <span className="text-[10px] uppercase tracking-wide rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-100 px-2 py-0.5">
                                                    {item.status}
                                                </span>
                                            )}
                                            {item.watching_status && (
                                                <span className="text-[10px] rounded-full bg-sky-500/20 border border-sky-400/60 text-sky-100 px-2 py-0.5">
                                                    {item.watching_status}
                                                </span>
                                            )}
                                        </div>

                                        {/* Genre chips lebih menonjol */}
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            <span className="text-[10px] rounded-full bg-purple-500/15 border border-purple-400/60 text-purple-100 px-2 py-0.5">
                                                {item.genre ?? "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-white group-hover:text-white">
                                        {item.title}
                                    </h2>

                                    <div className="mt-3 flex items-center justify-between">
                                        <a
                                            href={item.url || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-300 hover:text-blue-200 underline underline-offset-4"
                                        >
                                            Lihat Detail
                                        </a>

                                        <div className="text-[11px] text-gray-400">
                                            {item.episodes ? `${item.episodes} eps` : `ID: ${item.id}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-3">
                        <a
                            href={`?page=${page - 1}${selectedStatus ? `&status=${encodeURIComponent(selectedStatus)}` : ""
                                }`}
                            aria-disabled={page <= 1}
                            className={`px-3 py-1 rounded border border-white/10 text-sm ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-white/10"
                                }`}
                        >
                            ← Prev
                        </a>
                        <span className="text-sm text-gray-400">
                            Page {page}
                            {selectedStatus ? ` • ${selectedStatus}` : ""}
                        </span>
                        <a
                            href={`?page=${page + 1}${selectedStatus ? `&status=${encodeURIComponent(selectedStatus)}` : ""
                                }`}
                            className={`px-3 py-1 rounded border border-white/10 text-sm ${(hobbies?.length ?? 0) < PAGE_SIZE
                                ? "pointer-events-none opacity-40"
                                : "hover:bg-white/10"
                                }`}
                        >
                            Next →
                        </a>
                    </div>
                </>
            )}

            <div className="mt-12">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-white/10 to-white/5 px-3 py-1.5 text-xs text-gray-200 shadow-sm">
                        <span className="text-base">📝</span>
                        <span className="font-medium">Rekomendasi Anime dari Pengunjung</span>
                    </div>

                    <a
                        href="/rec/anime"
                        className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1.5 text-xs text-blue-200 hover:bg-blue-500/25 hover:border-blue-400/50 transition"
                    >
                        <span className="text-sm">➕</span>
                        <span className="underline underline-offset-4">Beri rekomendasi</span>
                    </a>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-gray-300">
                    <p className="leading-relaxed">
                        Rekomendasi anime yang dikirimkan oleh pengunjung akan
                        ditampilkan di sini. Jika kamu memiliki anime favorit yang
                        ingin direkomendasikan, silakan klik tombol "Beri
                        rekomendasi" di atas.
                    </p>
                </div>
                {!requests || requests.length === 0 ? (
                    // <p className="mt-3 text-sm text-gray-400">
                    //     {selectedStatus
                    //         ? `Belum ada request dengan status "${selectedStatus}".`
                    //         : "Belum ada request anime."}
                    // </p>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-white/5 grid place-items-center">
                        <span>📭</span>
                    </div>
                    <p className="text-sm text-gray-300">Belum ada request anime.</p>
                    <p className="mt-1 text-xs text-gray-500">
                        <a href="/rec/anime" className="underline underline-offset-4 text-blue-400 hover:text-blue-300">Rekomendasikan anime</a>
                    </p>
                </div>
                    
                ) : (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {(requests as Hobby[]).map((item) => (
                            <div
                                key={`req-${item.id}`}
                                className="group rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-white/2 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30"
                            >
                                <div className="relative">
                                    <div className="aspect-[4/5] w-full bg-neutral-800">
                                        <img
                                            src={item.image || "/placeholder.jpg"}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />

                                    <div className="absolute top-2 left-2 flex items-center gap-2">
                                        <span className="rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-[11px] text-white">
                                            {item.year ?? "—"}
                                        </span>
                                        <span className="rounded-full bg-yellow-400 text-black px-2 py-0.5 text-[11px] font-medium">
                                            ⭐ {item.score ?? "N/A"}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-gradient-to-t from-black/70 to-transparent">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {item.status && (
                                                <span className="text-[10px] uppercase tracking-wide rounded-full bg-white/10 border border-white/10 text-gray-200 px-2 py-0.5">
                                                    {item.status}
                                                </span>
                                            )}
                                            {item.watching_status && (
                                                <span className="text-[10px] rounded-full bg-white/10 border border-white/10 text-gray-200 px-2 py-0.5">
                                                    {item.watching_status}
                                                </span>
                                            )}
                                            {item.episodes && (
                                                <span className="text-[10px] rounded-full bg-white/10 border border-white/10 text-gray-200 px-2 py-0.5">
                                                    {item.episodes} eps
                                                </span>
                                            )}
                                            {item.studio && (
                                                <span className="text-[10px] rounded-full bg-white/10 border border-white/10 text-gray-200 px-2 py-0.5">
                                                    {item.studio}
                                                </span>
                                            )}
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                <span className="text-[10px] rounded-full bg-purple-500/15 border border-purple-400/60 text-purple-100 px-2 py-0.5">
                                                    {item.genre}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-white">
                                        {item.title}
                                    </h2>

                                    <div className="mt-3 flex items-center justify-between">
                                        <a
                                            href={item.url || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-300 hover:text-blue-200 underline underline-offset-4"
                                        >
                                            Lihat Detail
                                        </a>

                                        <div className="text-[11px] text-gray-400">
                                            Recomended by: {item.anonymous ?? "anonymous"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
