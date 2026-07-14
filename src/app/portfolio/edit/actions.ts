'use server';

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateProfile(formData: FormData) {
  const hero_title = formData.get('hero_title') as string;
  const hero_subtitle = formData.get('hero_subtitle') as string;
  const hero_image = formData.get('hero_image') as string;
  const github_url = formData.get('github_url') as string;
  const linkedin_url = formData.get('linkedin_url') as string;
  const motto = formData.get('motto') as string;
  const about_text = formData.get('about_text') as string; // Will store as raw string or JSON string
  const years_experience = formData.get('years_experience') as string;
  const projects_completed = formData.get('projects_completed') as string;

  // Let's store about_text as a JSON array of paragraphs by splitting newlines
  const paragraphs = about_text.split('\n').filter(p => p.trim() !== '');
  const about_text_json = JSON.stringify(paragraphs);

  const { error } = await supabase.from('portfolio_profile').upsert({
    id: 1,
    hero_title,
    hero_subtitle,
    hero_image,
    github_url,
    linkedin_url,
    motto,
    about_text: about_text_json,
    years_experience,
    projects_completed
  });

  if (error) throw new Error(error.message);
  revalidatePath('/portfolio');
  revalidatePath('/portfolio/edit');
}

export async function addSkill(formData: FormData) {
  const name = formData.get('name') as string;
  const percentage = formData.get('percentage') as string;
  const order_idx = parseInt(formData.get('order_idx') as string) || 0;

  const { error } = await supabase.from('portfolio_skills').insert({ name, percentage, order_idx });
  if (error) throw new Error(error.message);
  revalidatePath('/portfolio');
  revalidatePath('/portfolio/edit');
}

export async function deleteSkill(id: number) {
  const { error } = await supabase.from('portfolio_skills').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/portfolio');
  revalidatePath('/portfolio/edit');
}

export async function addExperience(formData: FormData) {
  const period = formData.get('period') as string;
  const title = formData.get('title') as string;
  const subtitle = formData.get('subtitle') as string;
  const order_idx = parseInt(formData.get('order_idx') as string) || 0;

  const { error } = await supabase.from('portfolio_experiences').insert({ period, title, subtitle, order_idx });
  if (error) throw new Error(error.message);
  revalidatePath('/portfolio');
  revalidatePath('/portfolio/edit');
}

export async function deleteExperience(id: number) {
  const { error } = await supabase.from('portfolio_experiences').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/portfolio');
  revalidatePath('/portfolio/edit');
}

export async function addProject(formData: FormData) {
  const type = formData.get('type') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const image = formData.get('image') as string;
  const link = formData.get('link') as string;
  const order_idx = parseInt(formData.get('order_idx') as string) || 0;

  const { error } = await supabase.from('portfolio_projects').insert({ type, title, description, image, link, order_idx });
  if (error) throw new Error(error.message);
  revalidatePath('/portfolio');
  revalidatePath('/portfolio/edit');
}

export async function deleteProject(id: number) {
  const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/portfolio');
  revalidatePath('/portfolio/edit');
}

export async function addHobby(formData: FormData) {
  const icon = formData.get('icon') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const link = formData.get('link') as string;
  const order_idx = parseInt(formData.get('order_idx') as string) || 0;

  const { error } = await supabase.from('portfolio_hobbies').insert({ icon, title, description, link: link || null, order_idx });
  if (error) throw new Error(error.message);
  revalidatePath('/portfolio');
  revalidatePath('/portfolio/edit');
}

export async function deleteHobby(id: number) {
  const { error } = await supabase.from('portfolio_hobbies').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/portfolio');
  revalidatePath('/portfolio/edit');
}
