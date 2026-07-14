'use server';

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function deleteBook(id: number) {
  const { error } = await supabase
    .from("hobbies")
    .delete()
    .eq("id", id)
    .eq("type_hobbies", "book");

  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath('/edit/buku');
  revalidatePath('/mylist/buku');
}

export async function updateBookStatus(id: number, newStatus: string) {
  const { error } = await supabase
    .from("hobbies")
    .update({ watching_status: newStatus })
    .eq("id", id)
    .eq("type_hobbies", "book");

  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath('/edit/buku');
  revalidatePath('/mylist/buku');
}
