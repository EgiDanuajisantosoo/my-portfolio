"use server";
import { createClient } from "@supabase/supabase-js";

export async function addBook(formData: FormData) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const data = {
        type_hobbies: "book",
        type: "favorite",
        title: String(formData.get("title")),
        image: String(formData.get("image")),
        year: formData.get("year") ? Number(formData.get("year")) : null,
        url: String(formData.get("url")),
        genre: String(formData.get("genre") ?? ""),
        synopsis: String(formData.get("synopsis") ?? ""),
        studio: String(formData.get("authors") ?? ""), // Menggunakan kolom studio untuk penulis
        episodes: formData.get("pageCount") ? Number(formData.get("pageCount")) : null, // Menggunakan episodes untuk jumlah halaman
        watching_status: "draft", // Default ke draft (Plan to Read)
    };

    if (!data.title) {
        throw new Error("Judul buku tidak valid");
    }

    // Cek duplikasi berdasarkan type_hobbies + title
    const { data: existing, error: checkError } = await supabase
        .from("hobbies")
        .select("id")
        .eq("type_hobbies", data.type_hobbies)
        .eq("title", data.title)
        .limit(1);

    if (checkError) {
        console.error("Supabase Check Error:", checkError);
        throw new Error("Gagal memeriksa duplikasi data");
    }

    if (existing && existing.length > 0) {
        throw new Error("Buku sudah ada di daftar koleksi");
    }

    const { error } = await supabase.from("hobbies").insert(data);
    if (error) {
        console.error("Supabase Insert Error:", error);
        throw new Error("Gagal menambahkan data ke tabel hobbies");
    }
}
