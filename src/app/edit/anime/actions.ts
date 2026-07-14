'use server';

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function deleteAnime(id: number) {
  const { error } = await supabase
    .from("hobbies")
    .delete()
    .eq("id", id)
    .eq("type_hobbies", "anime");

  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath('/edit/anime');
  revalidatePath('/mylist/anime');
}

export async function updateAnimeStatus(id: number, newStatus: string) {
  const { error } = await supabase
    .from("hobbies")
    .update({ watching_status: newStatus })
    .eq("id", id)
    .eq("type_hobbies", "anime");

  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath('/edit/anime');
  revalidatePath('/mylist/anime');
}
