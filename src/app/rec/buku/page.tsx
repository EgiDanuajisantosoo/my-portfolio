export const dynamic = "force-dynamic";
import SuccessAlert from "@/components/SuccessAlert";
import { addBookRec } from "./actions";
import { cookies } from 'next/headers';
import { getDictionary, Language } from '@/i18n/dictionaries';

async function getBooks(q: string, source: string) {
  let googleError = null;

  if (source === "google") {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
      if (apiKey) {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&key=${apiKey}&maxResults=12`,
          { next: { revalidate: 0 } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            return data.items.map((book: any) => {
              const info = book.volumeInfo;
              return {
                id: book.id,
                title: info.title || "Unknown Title",
                authors: info.authors ? info.authors.join(", ") : "Unknown Author",
                image: info.imageLinks?.thumbnail ? info.imageLinks.thumbnail.replace("http:", "https:") : "/placeholder.jpg",
                year: info.publishedDate ? info.publishedDate.substring(0, 4) : "",
                pageCount: info.pageCount ? String(info.pageCount) : "",
                genre: info.categories ? info.categories[0] : "",
                synopsis: info.description || "Sinopsis tidak tersedia.",
                url: info.infoLink || "",
                source: "Google Books"
              };
            });
          }
        } else {
          throw new Error(`Google API Error ${res.status}`);
        }
      }
    } catch (e: any) {
      throw new Error(`Google Books gagal: ${e.message}`);
    }
    return [];
  } 
  
  if (source === "oplib") {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) {
      throw new Error(`Open Library Error: ${res.status}`);
    }

    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      return data.docs.map((book: any, index: number) => {
        const uniqueKey = book.key ? book.key : `ol-book-${index}`;
        return {
          id: uniqueKey,
          title: book.title || "Unknown Title",
          authors: book.author_name ? book.author_name.join(", ") : "Unknown Author",
          image: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "/placeholder.jpg",
          year: book.first_publish_year ? String(book.first_publish_year) : "",
          pageCount: book.number_of_pages_median ? String(book.number_of_pages_median) : "",
          genre: book.subject && book.subject.length > 0 ? book.subject[0] : "",
          synopsis: "Sinopsis tidak tersedia dari Open Library.",
          url: book.key ? `https://openlibrary.org${book.key}` : "https://openlibrary.org",
          source: "Open Library"
        };
      });
    }
    return [];
  }

  return [];
}

async function getTrendingBooks() {
  try {
    const res = await fetch("https://openlibrary.org/trending/daily.json?limit=8", { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.works.map((book: any, index: number) => {
      const uniqueKey = book.key ? book.key : `ol-trend-${index}`;
      return {
        id: uniqueKey,
        title: book.title || "Unknown Title",
        authors: book.author_name ? book.author_name.join(", ") : "Unknown Author",
        image: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "/placeholder.jpg",
        year: book.first_publish_year ? String(book.first_publish_year) : "",
        pageCount: "",
        genre: book.subject && book.subject.length > 0 ? book.subject[0] : "",
        synopsis: "Sinopsis tidak tersedia dari Open Library.",
        url: book.key ? `https://openlibrary.org${book.key}` : "https://openlibrary.org",
        source: "Open Library Trending"
      };
    });
  } catch (e) {
    console.error("Failed to fetch trending books", e);
    return [];
  }
}

export default async function BookRecPage({ searchParams }: any) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('NEXT_LOCALE')?.value || 'id') as Language;
  const dict = getDictionary(lang).recBook;

  const params = await searchParams;
  const query = params?.q?.trim() || "";
  const source = params?.source === "oplib" ? "oplib" : "google";

  let bookList: any[] = [];
  let errorMsg = "";
  
  if (query) {
    try {
      bookList = await getBooks(query, source);
    } catch (e: any) {
      console.error("Fetch Books Error:", e);
      bookList = [];
      errorMsg = e.message;
    }
  }

  let trendingBooks: any[] = [];
  if (bookList.length === 0) {
    trendingBooks = await getTrendingBooks();
  }

  return (
    <>
      <SuccessAlert />
      <div className="p-6 max-w-6xl mx-auto min-h-screen pt-32">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              {dict.title}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {dict.subtitlePrefix} {source === "google" ? "Google Books" : "Open Library"}.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <a
              href="/mylist/buku"
              className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
            >
              {dict.backToList}
            </a>
            <a
              href="/portfolio"
              className="text-sm text-gray-400 hover:text-gray-300 underline underline-offset-4"
            >
              {dict.backToPortfolio}
            </a>
          </div>
        </div>

        {/* SEARCH FORM */}
        <form
          action="/rec/buku"
          className="mb-8 flex flex-col sm:flex-row gap-3 items-center backdrop-blur-sm p-3 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder={dict.searchPlaceholder}
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
              <input type="radio" name="source" value="google" defaultChecked={source === "google"} className="peer hidden" />
              <div className="px-4 py-1.5 text-xs text-center rounded-md transition-colors text-gray-400 hover:text-white peer-checked:bg-blue-600 peer-checked:text-white peer-checked:font-medium">
                Google Books
              </div>
            </label>
            <label className="flex-1 sm:flex-none cursor-pointer">
              <input type="radio" name="source" value="oplib" defaultChecked={source === "oplib"} className="peer hidden" />
              <div className="px-4 py-1.5 text-xs text-center rounded-md transition-colors text-gray-400 hover:text-white peer-checked:bg-blue-600 peer-checked:text-white peer-checked:font-medium">
                Open Library
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 w-full sm:w-auto text-white px-5 py-2.5 rounded-lg font-medium transition-all active:scale-95"
          >
            {dict.searchButton}
          </button>
        </form>

        {/* RENDER LIST BUKU */}
        {bookList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {bookList.map((book) => {
              const safeId = book.id.replace(/[^a-zA-Z0-9]/g, "");
              return (
                <div
                  key={book.id}
                  className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 
                backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 
                flex flex-col relative"
                >
                  {/* Source Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full border border-white/10">
                      via {book.source}
                    </span>
                  </div>

                  <a
                    href={book.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-[3/4] bg-black/20 overflow-hidden relative"
                  >
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                      loading="lazy"
                    />
                    {book.year && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold border border-white/10">
                        {book.year}
                      </div>
                    )}
                  </a>

                  {/* CONTENT */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Title */}
                    <h2 className="font-semibold text-sm text-white line-clamp-2 min-h-[40px]">
                      {book.title}
                    </h2>

                    {/* Authors */}
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {dict.author}: {book.authors}
                    </p>

                    <div className="flex-1"></div>

                    {/* Button */}
                    {/* Modal toggle (CSS-only) */}
                    <input id={`modal-${safeId}`} type="checkbox" className="peer hidden" />

                    <label
                      htmlFor={`modal-${safeId}`}
                      className="w-full h-10 text-xs bg-blue-600 hover:bg-blue-500 text-white 
                        rounded-lg font-medium mt-3 transition-all active:scale-[0.97] cursor-pointer 
                        inline-flex items-center justify-center"
                    >
                      {dict.sendRecommendation}
                    </label>

                    {/* Popup modal */}
                    <div className="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 p-4 peer-checked:flex">
                      <label htmlFor={`modal-${safeId}`} className="absolute inset-0 cursor-pointer" />

                      <div className="relative z-10 w-full max-w-md rounded-xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-white font-semibold leading-tight">{book.title}</h3>
                              <p className="text-xs text-gray-300 mt-1 line-clamp-1">
                                {book.authors || "-"}
                              </p>
                            </div>
                            <label
                              htmlFor={`modal-${safeId}`}
                              className="text-gray-400 hover:text-white cursor-pointer px-2 text-lg leading-none"
                            >
                              ✕
                            </label>
                          </div>
                        </div>

                        <form action={addBookRec} className="mt-4 space-y-3">
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <label className="block text-xs text-gray-300 mb-1">
                              {dict.nameLabel}
                            </label>
                            <input
                              type="text"
                              name="anonymous"
                              placeholder={dict.namePlaceholder}
                              className="w-full text-sm bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">
                              {dict.optional}
                            </p>
                          </div>

                          <input type="hidden" name="title" value={book.title} />
                          <input type="hidden" name="image" value={book.image} />
                          <input type="hidden" name="authors" value={book.authors} />
                          <input type="hidden" name="year" value={book.year} />
                          <input type="hidden" name="pageCount" value={book.pageCount} />
                          <input type="hidden" name="genre" value={book.genre} />
                          <input type="hidden" name="url" value={book.url} />
                          <input type="hidden" name="synopsis" value={book.synopsis} />

                          <div className="flex gap-3">
                            <button
                              type="submit"
                              className="flex-1 w-full h-10 text-xs bg-green-600 hover:bg-green-500 text-white 
                          rounded-lg font-medium transition-all active:scale-[0.97] hover:cursor-pointer"
                            >
                              {dict.saveRecommendation}
                            </button>

                            <label
                              htmlFor={`modal-${safeId}`}
                              className="flex-1 h-10 text-xs bg-gray-700 hover:bg-gray-600 text-white 
                          rounded-lg font-medium transition-all active:scale-[0.97] cursor-pointer 
                          inline-flex items-center justify-center"
                            >
                              {dict.cancel}
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
        ) : (
          <>
            {/* EMPTY STATE */}
            <div className="border border-dashed rounded-xl p-10 text-center text-gray-400 bg-white/5 backdrop-blur-sm border-white/20 mb-10">
              {query ? (
                <>
                  <p className="font-medium text-white mb-2">{dict.noResultsPrefix} "{query}" {dict.noResultsSuffix} {source === "google" ? "Google Books" : "Open Library"}.</p>
                  {errorMsg && <p className="text-xs text-red-400 mb-4">{errorMsg}</p>}
                  
                  {source === "google" ? (
                    <a href={`/rec/buku?q=${encodeURIComponent(query)}&source=oplib`} className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-500/30">
                      <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                      {dict.tryOpenLibrary}
                    </a>
                  ) : (
                    <a href={`/rec/buku?q=${encodeURIComponent(query)}&source=google`} className="inline-flex items-center gap-2 bg-green-600/20 text-green-400 hover:bg-green-600/40 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-green-500/30">
                      <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                      {dict.tryGoogleBooks}
                    </a>
                  )}
                </>
              ) : (
                <>
                  <p className="font-medium text-white">{dict.emptyStateTitle}</p>
                  <p className="text-sm mt-1">{dict.emptyStateSubtitle}</p>
                </>
              )}
            </div>

            {/* REKOMENDASI BUKU TRENDING */}
            {trendingBooks.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-yellow-400">trending_up</span>
                  <h3 className="font-semibold text-lg text-white">Inspirasi Buku Terpopuler</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {trendingBooks.map((book) => {
                    const safeId = book.id.replace(/[^a-zA-Z0-9]/g, "");
                    return (
                      <div
                        key={book.id}
                        className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 
                      backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 
                      flex flex-col relative"
                      >
                        <a
                          href={book.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block aspect-[3/4] bg-black/20 overflow-hidden relative"
                        >
                          <img
                            src={book.image}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                            loading="lazy"
                          />
                        </a>

                        <div className="p-4 flex flex-col flex-1">
                          <h2 className="font-semibold text-sm text-white line-clamp-2 min-h-[40px]">
                            {book.title}
                          </h2>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                            Oleh: {book.authors}
                          </p>
                          <div className="flex-1"></div>
                          
                          {/* Modal toggle (CSS-only) */}
                          <input id={`modal-trend-${safeId}`} type="checkbox" className="peer hidden" />

                          <label
                            htmlFor={`modal-trend-${safeId}`}
                            className="w-full h-10 text-xs border border-white/20 hover:bg-white/10 text-white 
                              rounded-lg font-medium mt-3 transition-all active:scale-[0.97] cursor-pointer 
                              inline-flex items-center justify-center"
                          >
                            Kirim Saran
                          </label>

                          {/* Popup modal */}
                          <div className="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 p-4 peer-checked:flex">
                            <label htmlFor={`modal-trend-${safeId}`} className="absolute inset-0 cursor-pointer" />

                            <div className="relative z-10 w-full max-w-md rounded-xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
                              <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                  <div className="flex-1">
                                    <h3 className="text-white font-semibold leading-tight">{book.title}</h3>
                                    <p className="text-xs text-gray-300 mt-1 line-clamp-1">
                                      {book.authors || "-"}
                                    </p>
                                  </div>
                                  <label
                                    htmlFor={`modal-trend-${safeId}`}
                                    className="text-gray-400 hover:text-white cursor-pointer px-2 text-lg leading-none"
                                  >
                                    ✕
                                  </label>
                                </div>
                              </div>

                              <form action={addBookRec} className="mt-4 space-y-3">
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                  <label className="block text-xs text-gray-300 mb-1">
                                    Nama / alias (opsional)
                                  </label>
                                  <input
                                    type="text"
                                    name="anonymous"
                                    placeholder="Masukkan nama atau alias Anda"
                                    className="w-full text-sm bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <input type="hidden" name="title" value={book.title} />
                                <input type="hidden" name="image" value={book.image} />
                                <input type="hidden" name="authors" value={book.authors} />
                                <input type="hidden" name="year" value={book.year} />
                                <input type="hidden" name="pageCount" value={book.pageCount} />
                                <input type="hidden" name="genre" value={book.genre} />
                                <input type="hidden" name="url" value={book.url} />
                                <input type="hidden" name="synopsis" value={book.synopsis} />

                                <div className="flex gap-3">
                                  <button
                                    type="submit"
                                    className="flex-1 w-full h-10 text-xs bg-green-600 hover:bg-green-500 text-white 
                                rounded-lg font-medium transition-all active:scale-[0.97] hover:cursor-pointer"
                                  >
                                    Simpan
                                  </button>
                                  <label
                                    htmlFor={`modal-trend-${safeId}`}
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
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
