"use server";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function addAnime(formData: FormData) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
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
