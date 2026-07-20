import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { cookies } from 'next/headers';
import { getDictionary, Language } from '@/i18n/dictionaries';

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

export default async function BookHobbyList({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string }>;
}) {
    const cookieStore = await cookies();
    const lang = (cookieStore.get('NEXT_LOCALE')?.value || 'id') as Language;
    const dict = getDictionary(lang).bookList;

    const WATCHING_STATUS_OPTIONS = [
        { value: "completed", label: dict.completed },
        { value: "watching", label: dict.watching },
        { value: "draft", label: dict.planToWatch }
    ];

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
                        <Link href="/portfolio" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 font-label-md">
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            {dict.backToPortfolio}
                        </Link>
                        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4 md:mb-6 tracking-tighter leading-tight">{dict.title}</h1>
                        <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-text-secondary leading-relaxed">
                            {dict.description}
                        </p>
                    </div>
                </section>

                {/* Filter Controls */}
                <section className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        <Link 
                            href={`?page=1`}
                            className={`px-4 py-2 md:px-6 md:py-2 rounded-full border font-label-md text-[11px] md:text-label-md transition-all ${!selectedStatus ? "border-white/10 bg-white/5 text-white active-filter" : "border-white/10 text-on-surface-variant hover:border-primary/50 hover:text-primary"}`}
                        >
                            {dict.allBooks}
                        </Link>
                        {WATCHING_STATUS_OPTIONS.map((st) => (
                            <Link
                                key={st.value}
                                href={`?page=1&status=${encodeURIComponent(st.value)}`}
                                className={`px-4 py-2 md:px-6 md:py-2 rounded-full border font-label-md text-[11px] md:text-label-md transition-all ${selectedStatus === st.value ? "border-white/10 bg-white/5 text-white active-filter" : "border-white/10 text-on-surface-variant hover:border-primary/50 hover:text-primary"}`}
                            >
                                {st.label}
                            </Link>
                        ))}
                    </div>
                    <div className="text-on-surface-variant font-label-md text-[12px] md:text-label-md flex items-center gap-2">
                        <span className="text-primary font-bold">{totalHobbies ?? 0}</span> {dict.booksListed}
                    </div>
                </section>

                {/* Book Grid */}
                {!hobbies || hobbies.length === 0 ? (
                    <div className="border border-outline bg-surface-container p-8 md:p-16 text-center">
                        <div className="mx-auto mb-4 h-16 w-16 bg-transparent border border-outline grid place-items-center">
                            <span className="text-2xl text-text-secondary">📚</span>
                        </div>
                        <h3 className="font-display text-[24px] uppercase tracking-[1.5px] text-text-primary mb-2">{dict.noBooks}</h3>
                        <p className="font-body-md text-text-secondary">
                            {selectedStatus ? dict.noBooksStatus : dict.noBooksTotal}
                        </p>
                        <Link href="/add-hobby/buku" className="inline-block mt-4 text-primary hover:underline">
                            + Cari & Tambah Buku Baru
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
                            {(hobbies as Hobby[]).map((item) => (
                                <div key={item.id} className="bg-surface-container rounded-none overflow-hidden flex flex-col group border border-outline hover:border-secondary transition-all duration-300 transform hover:scale-[1.02]">
                                    <div className="relative h-64 md:h-80 overflow-hidden bg-background border-b border-outline">
                                        <div 
                                            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105 grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100" 
                                            style={{ backgroundImage: `url('${item.image || "/placeholder.jpg"}')` }}
                                        ></div>
                                        <div className="absolute top-4 right-4 bg-transparent border border-primary text-primary px-3 py-1 rounded-none font-label-md uppercase tracking-[2px] text-[10px] font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">star</span> {item.score ?? "N/A"}/10
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8 flex flex-col flex-grow relative z-10">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {item.genre && (
                                                <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 border border-outline-variant text-text-secondary rounded-none group-hover:text-secondary group-hover:border-secondary transition-colors group-hover:scale-105 inline-block transition-all duration-300">
                                                    {item.genre.split(',')[0]}
                                                </span>
                                            )}
                                            {item.year && (
                                                <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 border border-outline-variant text-text-secondary rounded-none group-hover:text-secondary group-hover:border-secondary transition-colors group-hover:scale-105 inline-block transition-all duration-300">
                                                    {item.year}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-display text-[20px] md:text-[24px] uppercase tracking-[1px] md:tracking-[1.5px] text-text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-2 group-hover:scale-105 origin-left transition-all duration-300">{item.title}</h3>
                                        <p className="font-body-md text-text-secondary line-clamp-2 md:line-clamp-3 mb-8 flex-grow group-hover:text-secondary transition-colors group-hover:scale-105 origin-left transition-all duration-300">
                                            {item.synopsis || dict.synopsisNotAvailable}
                                        </p>
                                        <div className="pt-6 border-t border-outline flex justify-between items-center">
                                            <span className="font-label-md uppercase tracking-[2px] text-[11px] flex items-center gap-2 text-primary">
                                                {item.watching_status === 'completed' && <><span className="material-symbols-outlined text-[16px]">check</span> {dict.completed}</>}
                                                {item.watching_status === 'watching' && <><span className="material-symbols-outlined text-[16px]">menu_book</span> {dict.watching}</>}
                                                {item.watching_status === 'draft' && <><span className="material-symbols-outlined text-[16px] text-text-secondary">schedule</span> <span className="text-text-secondary">{dict.planToWatch}</span></>}
                                                {!item.watching_status && <><span className="material-symbols-outlined text-[16px] text-text-secondary">bookmark</span> <span className="text-text-secondary">{dict.added}</span></>}
                                            </span>
                                            <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="text-link hover:text-secondary transition-colors">
                                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
                                className={`flex items-center justify-center w-12 h-12 border border-outline transition-all duration-300 transform ${page <= 1 ? "pointer-events-none opacity-30" : "hover:border-secondary hover:text-secondary hover:scale-105 text-white"}`}
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <span className="font-label-md text-label-md text-text-secondary">
                                {dict.page} <span className="text-white">{page}</span>
                            </span>
                            <Link
                                href={`?page=${page + 1}${selectedStatus ? `&status=${encodeURIComponent(selectedStatus)}` : ""}`}
                                className={`flex items-center justify-center w-12 h-12 border border-outline transition-all duration-300 transform ${(hobbies?.length ?? 0) < PAGE_SIZE ? "pointer-events-none opacity-30" : "hover:border-secondary hover:text-secondary hover:scale-105 text-white"}`}
                            >
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                        </div>
                    </>
                )}
            </main>

            {/* Enhanced Recommendation Section */}
            <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-t border-outline mt-32">
                <div className="bg-background border border-outline p-8 md:p-16 relative">
                    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12 lg:items-start relative z-10">
                        <div className="flex flex-col items-center text-center py-8 w-full">
                            <div className="w-16 h-px bg-hairline-strong mb-8"></div>
                            <h2 className="font-display text-[28px] md:text-display-lg uppercase tracking-[2px] md:tracking-[3px] text-text-primary mb-6 leading-none">{dict.giveRecTitle}</h2>
                            <p className="font-body-md text-text-secondary max-w-2xl mb-12">
                                {dict.giveRecDesc}
                            </p>
                            <Link 
                                href="/rec/buku" 
                                className="group flex items-center justify-center gap-3 md:gap-4 bg-transparent border border-primary text-primary font-label-md uppercase tracking-[1.5px] md:tracking-[2.5px] text-[12px] md:text-[14px] px-6 py-3 md:px-12 md:py-4 rounded-none transition-all duration-300 transform hover:scale-105 hover:bg-secondary hover:text-on-secondary hover:border-secondary w-full sm:w-auto"
                            >
                                {dict.startRec}
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 text-[16px]">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Requested Book List */}
                {requests && requests.length > 0 && (
                    <div className="mt-32 max-w-6xl mx-auto">
                        <div className="flex items-center gap-4 mb-12 border-b border-outline pb-4">
                            <span className="material-symbols-outlined text-2xl text-text-secondary">forum</span>
                            <h3 className="font-display text-[24px] uppercase tracking-[1.5px] text-text-primary">{dict.visitorSug}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                            {(requests as Hobby[]).map((item) => (
                                <div key={`req-${item.id}`} className="bg-surface-container border border-outline rounded-none overflow-hidden flex flex-col hover:border-secondary transition-all duration-300 transform hover:scale-[1.02] group">
                                    <div className="flex items-start gap-6 p-6">
                                        <img 
                                            src={item.image || "/placeholder.jpg"} 
                                            alt={item.title} 
                                            className="w-20 h-28 object-cover rounded-none grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-display text-[18px] md:text-[20px] uppercase tracking-[1px] text-text-primary mb-1 group-hover:text-secondary group-hover:scale-105 origin-left transition-all duration-300 line-clamp-2">{item.title}</h4>

                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="font-label-md uppercase tracking-[2px] text-[10px] text-text-secondary border border-outline px-2 py-1 group-hover:border-secondary group-hover:text-secondary group-hover:scale-105 transition-all duration-300 inline-block">{item.score ? `★ ${item.score}` : 'TBD'}</span>
                                            </div>
                                            <p className="font-body-sm text-text-secondary line-clamp-2 group-hover:text-secondary group-hover:scale-105 origin-left transition-all duration-300">{item.synopsis || dict.recBySomeone}</p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 border-t border-outline flex justify-between items-center bg-background">
                                        <span className="font-label-md uppercase tracking-[2px] text-[10px] text-text-secondary">DARI: {item.anonymous || "ANONYMOUS"}</span>
                                        <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="font-label-md uppercase tracking-[2px] text-[10px] text-link hover:text-secondary transition-colors">
                                            DETAIL
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
