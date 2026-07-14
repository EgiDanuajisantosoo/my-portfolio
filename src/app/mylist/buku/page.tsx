import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Hobby = {
    id: number;
    title: string;
    image?: string | null;
    url?: string | null;
    year?: number | null;
    score?: number | null;
    genre?: string | null;
    episodes?: number | null; // Digunakan untuk Page Count
    status?: string | null;
    studio?: string | null; // Digunakan untuk Authors
    synopsis?: string | null;
    type_hobbies?: string | null;
    anonymous?: string | null;
    watching_status?: string | null;
};

const PAGE_SIZE = 12;
const REQUEST_TYPE = "request";
const FAVORITE_TYPE = "favorite";

const WATCHING_STATUS_OPTIONS = [
    { label: "Selesai Dibaca", value: "selesai" },
    { label: "Sedang Dibaca", value: "on-going" },
    { label: "Rencana Dibaca", value: "draft" }
];

export default async function BookHobbyList({
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
    const selectedStatus = params.status && params.status !== "all" ? params.status.trim() : undefined;

    // Favorites (Books)
    let favQuery = supabase
        .from("hobbies")
        .select("*", { count: "exact" })
        .eq("type_hobbies", "book")
        .eq("type", FAVORITE_TYPE)
        .order("id", { ascending: false })
        .range(from, to);

    if (selectedStatus && selectedStatus !== "all") {
        favQuery = favQuery.eq("watching_status", selectedStatus);
    }

    const { data: hobbies, count: totalHobbies, error } = await favQuery;

    // Requests (Books)
    let reqQuery = supabase
        .from("hobbies")
        .select("*")
        .eq("type_hobbies", "book")
        .eq("type", REQUEST_TYPE)
        .order("id", { ascending: false })
        .limit(6);

    const { data: requests } = await reqQuery;

    if (error) {
        return (
            <div className="max-w-container-max mx-auto p-6 pt-32">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                    Terjadi kesalahan saat mengambil data.
                </div>
            </div>
        );
    }

    return (
        <>
            <main className="pt-32 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
                {/* Hero Section */}
                <section className="mb-16">
                    <div className="max-w-3xl">
                        <h1 className="font-display-lg text-display-lg text-primary mb-6 tracking-tighter leading-tight">My Book List</h1>
                        <p className="font-body-lg text-body-lg text-text-secondary leading-relaxed">
                            Koleksi buku-buku yang telah membuka wawasan saya. Dari literatur teknis hingga fiksi yang menggugah pikiran, 
                            ini adalah buku-buku yang saya baca dan saya rekomendasikan.
                        </p>
                    </div>
                </section>

                {/* Filter Controls */}
                <section className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-wrap gap-3">
                        <Link 
                            href={`?page=1`}
                            className={`px-6 py-2 rounded-full border font-label-md text-label-md transition-all ${!selectedStatus ? "border-white/10 bg-white/5 text-white active-filter" : "border-white/10 text-on-surface-variant hover:border-primary/50 hover:text-primary"}`}
                        >
                            Semua Buku
                        </Link>
                        {WATCHING_STATUS_OPTIONS.map((st) => (
                            <Link
                                key={st.value}
                                href={`?page=1&status=${encodeURIComponent(st.value)}`}
                                className={`px-6 py-2 rounded-full border font-label-md text-label-md transition-all ${selectedStatus === st.value ? "border-white/10 bg-white/5 text-white active-filter" : "border-white/10 text-on-surface-variant hover:border-primary/50 hover:text-primary"}`}
                            >
                                {st.label}
                            </Link>
                        ))}
                    </div>
                    <div className="text-on-surface-variant font-label-md text-label-md flex items-center gap-2">
                        <span className="text-primary font-bold">{totalHobbies ?? 0}</span> Buku Tersimpan
                    </div>
                </section>

                {/* Book Grid */}
                {!hobbies || hobbies.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-surface-container/30 p-16 text-center glass-panel">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-white/5 grid place-items-center">
                            <span className="text-2xl">📚</span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-white mb-2">Belum Ada Buku</h3>
                        <p className="text-text-secondary">
                            {selectedStatus ? `Tidak ada buku dengan status yang dipilih.` : "Mulai tambahkan buku favorit Anda ke koleksi ini."}
                        </p>
                        <Link href="/add-hobby/buku" className="inline-block mt-4 text-primary hover:underline">
                            + Cari & Tambah Buku Baru
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                            {(hobbies as Hobby[]).map((item) => (
                                <div key={item.id} className="anime-card glass-panel rounded-2xl overflow-hidden flex flex-col group bg-surface-container/30 border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(30,215,96,0.1)]">
                                    <div className="relative h-80 overflow-hidden">
                                        <div 
                                            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                                            style={{ backgroundImage: `url('${item.image || "/placeholder.jpg"}')` }}
                                        ></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-60"></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow relative z-10 -mt-20">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {item.genre && (
                                                <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-primary/20 text-primary rounded-md border border-primary/20 backdrop-blur-md">
                                                    {item.genre.split(',')[0]}
                                                </span>
                                            )}
                                            {item.year && (
                                                <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-surface-raised text-white rounded-md border border-white/10 backdrop-blur-md">
                                                    {item.year}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-headline-md text-headline-md text-white mb-1 group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                                        <p className="text-xs text-primary mb-3">Oleh: {item.studio || "Unknown"}</p>
                                        
                                        <p className="font-body-md text-body-md text-text-secondary line-clamp-3 mb-6 flex-grow">
                                            {item.synopsis || "Sinopsis tidak tersedia untuk buku ini."}
                                        </p>
                                        <div className="pt-5 border-t border-white/10 flex justify-between items-center">
                                            <span className="font-label-md text-label-md flex items-center gap-2 text-primary">
                                                {item.watching_status === 'selesai' && <><span className="material-symbols-outlined text-[20px]">check_circle</span> Selesai Dibaca</>}
                                                {item.watching_status === 'on-going' && <><span className="material-symbols-outlined text-[20px] animate-pulse">menu_book</span> Sedang Dibaca</>}
                                                {item.watching_status === 'draft' && <><span className="material-symbols-outlined text-[20px] text-tertiary">schedule</span> <span className="text-tertiary">Rencana Dibaca</span></>}
                                                {!item.watching_status && <><span className="material-symbols-outlined text-[20px]">bookmark</span> Disimpan</>}
                                            </span>
                                            <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-white transition-colors flex items-center gap-1 text-xs">
                                                <span>Detail</span>
                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-16 flex items-center justify-center gap-4">
                            <Link
                                href={`?page=${page - 1}${selectedStatus ? `&status=${encodeURIComponent(selectedStatus)}` : ""}`}
                                className={`flex items-center justify-center w-12 h-12 rounded-full border border-white/10 transition-colors ${page <= 1 ? "pointer-events-none opacity-30" : "hover:bg-white/5 hover:border-primary/50 text-white"}`}
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <span className="font-label-md text-label-md text-text-secondary">
                                Page <span className="text-white">{page}</span>
                            </span>
                            <Link
                                href={`?page=${page + 1}${selectedStatus ? `&status=${encodeURIComponent(selectedStatus)}` : ""}`}
                                className={`flex items-center justify-center w-12 h-12 rounded-full border border-white/10 transition-colors ${(hobbies?.length ?? 0) < PAGE_SIZE ? "pointer-events-none opacity-30" : "hover:bg-white/5 hover:border-primary/50 text-white"}`}
                            >
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                        </div>
                    </>
                )}
            </main>

            {/* Enhanced Recommendation Section */}
            <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                <div className="glass-panel rounded-3xl p-8 md:p-16 border border-primary/20 bg-surface-container/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full"></div>
                        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full"></div>
                    </div>
                    
                    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12 lg:items-start relative z-10">
                        <div className="flex flex-col items-center text-center py-8 w-full">
                            <div className="w-16 h-1 bg-primary mb-8"></div>
                            <h2 className="font-display-lg text-display-lg text-white mb-6 tracking-tighter leading-none">Berikan Rekomendasi</h2>
                            <p className="font-body-lg text-body-lg text-text-secondary max-w-2xl mb-10">
                                Punya buku favorit yang belum ada di daftar ini? Bagikan rekomendasi Anda. 
                                Saran Anda akan membantu saya menemukan literatur menarik berikutnya untuk dibaca.
                            </p>
                            <Link 
                                href="/rec/buku" 
                                className="group flex items-center justify-center gap-3 bg-primary text-on-primary font-label-md text-label-md px-12 py-5 rounded-full font-bold active:scale-95 duration-200 transition-all hover:shadow-[0_0_30px_rgba(30,215,96,0.4)]"
                            >
                                Mulai Rekomendasikan
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Requested Book List */}
                {requests && requests.length > 0 && (
                    <div className="mt-20">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="material-symbols-outlined text-3xl text-secondary">forum</span>
                            <h3 className="font-headline-md text-headline-md text-white">Saran dari Pengunjung</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(requests as Hobby[]).map((item) => (
                                <div key={`req-${item.id}`} className="glass-panel rounded-xl overflow-hidden flex flex-col bg-surface-container/20 border border-white/5">
                                    <div className="flex items-start gap-4 p-5">
                                        <img 
                                            src={item.image || "/placeholder.jpg"} 
                                            alt={item.title} 
                                            className="w-20 h-28 object-cover rounded-lg shadow-md"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-headline-sm text-lg text-white font-semibold line-clamp-2 mb-1">{item.title}</h4>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded font-bold">
                                                    {item.studio || "Unknown Author"}
                                                </span>
                                            </div>
                                            <p className="font-body-md text-xs text-text-secondary line-clamp-2">{item.synopsis || "Recommended by someone."}</p>
                                        </div>
                                    </div>
                                    <div className="px-5 py-3 border-t border-white/5 flex justify-between items-center bg-black/20">
                                        <span className="text-xs text-text-secondary italic">Dari: {item.anonymous || "Anonymous"}</span>
                                        <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                            Detail
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}
