"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Dummy Auth ---
export async function authenticate(formData: FormData) {
  const user = formData.get("username") as string;
  const pass = formData.get("password") as string;

  if (user === "egiii" && pass === "@bakwan010011") {
    const cookieStore = await cookies();
    cookieStore.set("portfolio_admin_auth", "true", { path: "/" });
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("portfolio_admin_auth");
}

// --- PROFILE ACTIONS ---
export async function updateProfile(formData: FormData) {
  // Convert about_text (which is a textarea with newlines) to JSON array
  const aboutStr = formData.get("about_text") as string;
  const aboutArray = aboutStr.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  const about_text = JSON.stringify(aboutArray);

  const aboutEnStr = formData.get("about_text_en") as string;
  const aboutEnArray = aboutEnStr.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  const about_text_en = aboutEnStr ? JSON.stringify(aboutEnArray) : null;

  const data = {
    hero_title: formData.get("hero_title"),
    hero_title_en: formData.get("hero_title_en"),
    hero_subtitle: formData.get("hero_subtitle"),
    hero_subtitle_en: formData.get("hero_subtitle_en"),
    motto: formData.get("motto"),
    motto_en: formData.get("motto_en"),
    about_text,
    about_text_en,
    github_url: formData.get("github_url"),
    linkedin_url: formData.get("linkedin_url"),
    hero_image: formData.get("hero_image"),
    years_experience: formData.get("years_experience"),
    projects_completed: formData.get("projects_completed"),
  };

  const { error } = await supabase.from("portfolio_profile").update(data).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

// --- SKILLS ACTIONS ---
export async function addSkill(formData: FormData) {
  const data = {
    name: formData.get("name"),
    percentage: formData.get("percentage"),
    order_idx: parseInt(formData.get("order_idx") as string) || 0,
  };
  const { error } = await supabase.from("portfolio_skills").insert([data]);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

export async function updateSkill(formData: FormData) {
  const id = formData.get("id");
  const data = {
    name: formData.get("name"),
    percentage: formData.get("percentage"),
    order_idx: parseInt(formData.get("order_idx") as string) || 0,
  };
  const { error } = await supabase.from("portfolio_skills").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

export async function deleteSkill(formData: FormData) {
  const id = formData.get("id");
  const { error } = await supabase.from("portfolio_skills").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

// --- EXPERIENCES ACTIONS ---
export async function addExperience(formData: FormData) {
  const data = {
    title: formData.get("title"),
    title_en: formData.get("title_en"),
    subtitle: formData.get("subtitle"),
    subtitle_en: formData.get("subtitle_en"),
    period: formData.get("period"),
    period_en: formData.get("period_en"),
    order_idx: parseInt(formData.get("order_idx") as string) || 0,
  };
  const { error } = await supabase.from("portfolio_experiences").insert([data]);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

export async function updateExperience(formData: FormData) {
  const id = formData.get("id");
  const data = {
    title: formData.get("title"),
    title_en: formData.get("title_en"),
    subtitle: formData.get("subtitle"),
    subtitle_en: formData.get("subtitle_en"),
    period: formData.get("period"),
    period_en: formData.get("period_en"),
    order_idx: parseInt(formData.get("order_idx") as string) || 0,
  };
  const { error } = await supabase.from("portfolio_experiences").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

export async function deleteExperience(formData: FormData) {
  const id = formData.get("id");
  const { error } = await supabase.from("portfolio_experiences").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

// --- PROJECTS ACTIONS ---
export async function addProject(formData: FormData) {
  const data = {
    type: formData.get("type") || "project",
    title: formData.get("title"),
    title_en: formData.get("title_en"),
    description: formData.get("description"),
    description_en: formData.get("description_en"),
    image: formData.get("image"),
    link: formData.get("link"),
    order_idx: parseInt(formData.get("order_idx") as string) || 0,
  };
  const { error } = await supabase.from("portfolio_projects").insert([data]);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

export async function updateProject(formData: FormData) {
  const id = formData.get("id");
  const data = {
    type: formData.get("type") || "project",
    title: formData.get("title"),
    title_en: formData.get("title_en"),
    description: formData.get("description"),
    description_en: formData.get("description_en"),
    image: formData.get("image"),
    link: formData.get("link"),
    order_idx: parseInt(formData.get("order_idx") as string) || 0,
  };
  const { error } = await supabase.from("portfolio_projects").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

export async function deleteProject(formData: FormData) {
  const id = formData.get("id");
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

// --- HOBBIES ACTIONS ---
export async function addHobby(formData: FormData) {
  const data = {
    icon: formData.get("icon"),
    title: formData.get("title"),
    title_en: formData.get("title_en"),
    description: formData.get("description"),
    description_en: formData.get("description_en"),
    link: formData.get("link") || null,
    order_idx: parseInt(formData.get("order_idx") as string) || 0,
  };
  const { error } = await supabase.from("portfolio_hobbies").insert([data]);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

export async function updateHobby(formData: FormData) {
  const id = formData.get("id");
  const data = {
    icon: formData.get("icon"),
    title: formData.get("title"),
    title_en: formData.get("title_en"),
    description: formData.get("description"),
    description_en: formData.get("description_en"),
    link: formData.get("link") || null,
    order_idx: parseInt(formData.get("order_idx") as string) || 0,
  };
  const { error } = await supabase.from("portfolio_hobbies").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}

export async function deleteHobby(formData: FormData) {
  const id = formData.get("id");
  const { error } = await supabase.from("portfolio_hobbies").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portfolio");
  revalidatePath("/edit/portfolio");
}
