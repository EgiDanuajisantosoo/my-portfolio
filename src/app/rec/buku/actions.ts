"use server";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function addBookRec(formData: FormData) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const title = String(formData.get("title"));
  
  // Cek duplikasi berdasarkan type_hobbies + title + type "request"
  const { count, error: checkError } = await supabase
    .from("hobbies")
    .select("id", { count: "exact", head: true })
    .eq("type_hobbies", "book")
    .eq("type", "request")
    .eq("title", title);

  if (checkError) {
    console.error("Supabase Check Error:", checkError);
    throw new Error("Gagal memeriksa duplikasi data");
  }

  if ((count ?? 0) > 0) {
    console.log("Data duplikat, tidak disimpan:", { type_hobbies: "book", title });
    redirect("/rec/buku?success=0&duplicate=1");
  }

  const data = {
    type_hobbies: "book",
    type: "request",
    anonymous: formData.get("anonymous") || null,
    title: title,
    image: String(formData.get("image")),
    year: formData.get("year") ? Number(formData.get("year")) : null,
    url: String(formData.get("url")),
    genre: String(formData.get("genre") ?? ""),
    synopsis: String(formData.get("synopsis") ?? ""),
    studio: String(formData.get("authors") ?? ""), // Menggunakan kolom studio untuk penulis
    episodes: formData.get("pageCount") ? Number(formData.get("pageCount")) : null, // Menggunakan episodes untuk jumlah halaman
  };

  console.log("Data ready to insert:", data);

  const { error } = await supabase.from("hobbies").insert(data);

  if (error) {
    if ((error as any).code === "23505") {
      console.warn("Unique violation, data sudah ada:", { type_hobbies: "book", title });
      redirect("/rec/buku?success=0&duplicate=1");
    }
    console.error("Supabase Insert Error:", error);
    throw new Error("Gagal menambahkan data ke tabel hobbies");
  }

  console.log("Berhasil disimpan ke Supabase");
  redirect("/rec/buku?success=1");
}
