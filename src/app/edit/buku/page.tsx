import React from 'react';
import { createClient } from "@supabase/supabase-js";
import { deleteBook, updateBookStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function EditBukuPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: bookList, error } = await supabase
    .from("hobbies")
    .select("*")
    .eq("type_hobbies", "book")
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Fetch Buku Error:", error);
  }

  const items = bookList || [];

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen pt-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-green-500">settings</span>
            Kelola Buku
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Ubah status atau hapus koleksi buku Anda.
          </p>
        </div>
        <div className="flex gap-4">
          <a href="/add-hobby/buku" className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4">
            + Tambah Baru
          </a>
          <a href="/mylist/buku" className="text-sm text-gray-400 hover:text-white underline underline-offset-4">
            Lihat Koleksi
          </a>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((book: any) => (
              <div key={book.id} className="bg-black/20 rounded-xl overflow-hidden border border-white/5 flex flex-col">
                <div className="aspect-[3/4] relative overflow-hidden bg-black/40">
                  <img src={book.image || '/placeholder.jpg'} alt={book.title} className="w-full h-full object-cover opacity-80" />
                  {book.year && (
                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white border border-white/10">
                      {book.year}
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-medium text-sm text-white line-clamp-2 min-h-[40px]">{book.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-1">{book.studio || '-'} • {book.episodes || '?'} Halaman</p>
                  
                  <div className="flex-1"></div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <form action={async (fd) => {
                      "use server";
                      await updateBookStatus(book.id, fd.get('status') as string);
                    }} className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Status Membaca:</label>
                      <div className="flex gap-2">
                        <select 
                          key={book.watching_status}
                          name="status" 
                          defaultValue={book.watching_status || 'draft'} 
                          className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none"
                        >
                          <option value="draft" className="bg-gray-800 text-white">Rencana Dibaca</option>
                          <option value="watching" className="bg-gray-800 text-white">Sedang Dibaca</option>
                          <option value="completed" className="bg-gray-800 text-white">Selesai Dibaca</option>
                        </select>
                        <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-xs cursor-pointer active:scale-95 transition-transform">Simpan</button>
                      </div>
                    </form>

                    <form action={async () => {
                      "use server";
                      await deleteBook(book.id);
                    }}>
                      <button type="submit" className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-3 py-1.5 rounded text-xs transition-colors">
                        Hapus dari Koleksi
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 block">inbox</span>
            <p className="text-gray-400">Koleksi buku masih kosong.</p>
          </div>
        )}
      </div>
    </div>
  );
}
