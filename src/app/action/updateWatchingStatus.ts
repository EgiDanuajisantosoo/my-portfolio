"use server";

import { createClient } from "@supabase/supabase-js";

export async function updateWatchingStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const newStatus = String(formData.get("watching_status"));

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    { auth: { persistSession: false } }
  );

  const { error } = await supabase
    .from("hobbies")
    .update({ watching_status: newStatus })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Gagal update watching_status");
  }

  // Optional: REFRESH halaman setelah update
}
