"use server";
import { createClient } from "@supabase/supabase-js";

export async function addAnime(formData: FormData) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const data = {
        type_hobbies: "anime",
        type: "favorite",
        mal_id: Number(formData.get("mal_id")),
        title: String(formData.get("title")),
        image: String(formData.get("image")),
        score: formData.get("score") ? Number(formData.get("score")) : null,
        year: formData.get("year") ? Number(formData.get("year")) : null,
        url: String(formData.get("url")),
        genre: String(formData.get("genre") ?? ""),
    };

    if (!data.mal_id || Number.isNaN(data.mal_id)) {
        throw new Error("mal_id tidak valid");
    }

    // Cek hanya berdasarkan type_hobbies + mal_id (abaikan type)
    const { data: existing, error: checkError } = await supabase
        .from("hobbies")
        .select("id")
        .eq("type_hobbies", data.type_hobbies)
        .eq("mal_id", data.mal_id)
        .limit(1);

    if (checkError) {
        console.error("Supabase Check Error:", checkError);
        throw new Error("Gagal memeriksa duplikasi data");
    }

    if (existing && existing.length > 0) {
        throw new Error("Anime sudah ada di daftar");
    }

    const { error } = await supabase.from("hobbies").insert(data);
    if (error) {
        console.error("Supabase Insert Error:", error);
        throw new Error("Gagal menambahkan data ke tabel hobbies");
    }
}