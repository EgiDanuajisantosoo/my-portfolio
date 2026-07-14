import React from 'react';
import { createClient } from "@supabase/supabase-js";
import { 
  updateProfile, 
  addSkill, deleteSkill, 
  addExperience, deleteExperience, 
  addProject, deleteProject, 
  addHobby, deleteHobby 
} from "./actions";

export const dynamic = "force-dynamic";

export default async function PortfolioEditPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase.from('portfolio_profile').select('*').eq('id', 1).single();
  const { data: skills } = await supabase.from('portfolio_skills').select('*').order('order_idx');
  const { data: experiences } = await supabase.from('portfolio_experiences').select('*').order('order_idx');
  const { data: projects } = await supabase.from('portfolio_projects').select('*').order('order_idx');
  const { data: hobbies } = await supabase.from('portfolio_hobbies').select('*').order('order_idx');

  // Parse about_text
  let aboutRaw = "";
  try {
    if (profile?.about_text) {
      const arr = JSON.parse(profile.about_text);
      aboutRaw = Array.isArray(arr) ? arr.join('\n\n') : profile.about_text;
    }
  } catch (e) {
    aboutRaw = profile?.about_text || "";
  }

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen pt-32 space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Edit Portofolio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Atur konten halaman portofolio Anda secara dinamis.
          </p>
        </div>
        <a href="/portfolio" className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4">
          Lihat Portofolio
        </a>
      </div>

      {/* 1. PROFILE SETTINGS */}
      <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">person</span> Profil Utama
        </h2>
        <form action={updateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Judul Hero</label>
              <input type="text" name="hero_title" defaultValue={profile?.hero_title} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white" required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Subjudul Hero</label>
              <input type="text" name="hero_subtitle" defaultValue={profile?.hero_subtitle} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white" required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Gambar Profil (URL / Path)</label>
              <input type="text" name="hero_image" defaultValue={profile?.hero_image} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">URL GitHub</label>
              <input type="text" name="github_url" defaultValue={profile?.github_url} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">URL LinkedIn</label>
              <input type="text" name="linkedin_url" defaultValue={profile?.linkedin_url} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">Motto</label>
              <textarea name="motto" defaultValue={profile?.motto} rows={2} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">Tentang Saya (Gunakan Enter untuk paragraf baru)</label>
              <textarea name="about_text" defaultValue={aboutRaw} rows={6} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Total Pengalaman</label>
              <input type="text" name="years_experience" defaultValue={profile?.years_experience} placeholder="Contoh: 3+" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Total Proyek</label>
              <input type="text" name="projects_completed" defaultValue={profile?.projects_completed} placeholder="Contoh: 10+" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all">Simpan Profil</button>
          </div>
        </form>
      </section>

      {/* 2. SKILLS */}
      <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-500">psychology</span> Keahlian (Skills)
        </h2>
        
        <div className="space-y-4 mb-8">
          {skills?.map((skill: any) => (
            <div key={skill.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
              <div>
                <p className="text-white font-medium">{skill.name} <span className="text-gray-400 text-sm">({skill.percentage})</span></p>
                <p className="text-xs text-gray-500">Urutan: {skill.order_idx}</p>
              </div>
              <form action={async () => { "use server"; await deleteSkill(skill.id); }}>
                <button type="submit" className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-400/10 rounded-md">Hapus</button>
              </form>
            </div>
          ))}
          {(!skills || skills.length === 0) && <p className="text-sm text-gray-500">Belum ada data keahlian.</p>}
        </div>

        <form action={addSkill} className="flex flex-col sm:flex-row gap-3 items-end bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex-1 w-full">
            <label className="block text-xs text-gray-400 mb-1">Nama Keahlian</label>
            <input type="text" name="name" required placeholder="Contoh: Laravel" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-xs text-gray-400 mb-1">Persentase</label>
            <input type="text" name="percentage" required placeholder="Contoh: 90%" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div className="w-full sm:w-24">
            <label className="block text-xs text-gray-400 mb-1">Urutan</label>
            <input type="number" name="order_idx" defaultValue="0" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md font-medium text-sm transition-all h-[38px]">Tambah</button>
        </form>
      </section>

      {/* 3. EXPERIENCES */}
      <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-500">school</span> Pendidikan & Pengalaman
        </h2>
        
        <div className="space-y-4 mb-8">
          {experiences?.map((exp: any) => (
            <div key={exp.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
              <div>
                <p className="text-white font-medium">{exp.title}</p>
                <p className="text-sm text-gray-400">{exp.subtitle} | {exp.period}</p>
              </div>
              <form action={async () => { "use server"; await deleteExperience(exp.id); }}>
                <button type="submit" className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-400/10 rounded-md">Hapus</button>
              </form>
            </div>
          ))}
          {(!experiences || experiences.length === 0) && <p className="text-sm text-gray-500">Belum ada data pengalaman.</p>}
        </div>

        <form action={addExperience} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-white/5 p-4 rounded-xl border border-white/10">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Periode</label>
            <input type="text" name="period" required placeholder="Contoh: 2023 - Saat Ini" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Institusi / Tempat</label>
            <input type="text" name="title" required placeholder="Contoh: Telkom University" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Posisi / Jurusan</label>
            <input type="text" name="subtitle" required placeholder="Contoh: D3 Rekayasa Perangkat Lunak" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div className="flex gap-2">
            <div className="w-16">
              <label className="block text-xs text-gray-400 mb-1">Urutan</label>
              <input type="number" name="order_idx" defaultValue="0" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
            </div>
            <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-2 py-2 rounded-md font-medium text-sm transition-all h-[38px]">Tambah</button>
          </div>
        </form>
      </section>

      {/* 4. PROJECTS & CERTS */}
      <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-500">folder_special</span> Proyek & Sertifikasi
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {projects?.map((proj: any) => (
            <div key={proj.id} className="flex flex-col bg-black/20 p-4 rounded-xl border border-white/5 relative">
              <div className="absolute top-2 right-2 flex gap-2">
                 <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300 uppercase">{proj.type}</span>
                 <form action={async () => { "use server"; await deleteProject(proj.id); }}>
                  <button type="submit" className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded hover:bg-red-400/20">Hapus</button>
                 </form>
              </div>
              <p className="text-white font-medium pr-20">{proj.title}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{proj.description}</p>
            </div>
          ))}
          {(!projects || projects.length === 0) && <p className="text-sm text-gray-500">Belum ada data proyek.</p>}
        </div>

        <form action={addProject} className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tipe</label>
            <select name="type" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white">
              <option value="project">Project</option>
              <option value="certificate">Sertifikasi</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Judul</label>
            <input type="text" name="title" required className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Deskripsi</label>
            <textarea name="description" rows={2} required className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Gambar (URL / Path)</label>
            <input type="text" name="image" placeholder="/proyek/contoh.png" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Link URL</label>
            <input type="text" name="link" placeholder="https://github.com/..." className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div className="flex items-end gap-3 sm:col-span-2">
            <div className="w-24">
              <label className="block text-xs text-gray-400 mb-1">Urutan</label>
              <input type="number" name="order_idx" defaultValue="0" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
            </div>
            <button type="submit" className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-md font-medium text-sm transition-all h-[38px]">Tambah Proyek/Sertifikasi</button>
          </div>
        </form>
      </section>

      {/* 5. HOBBIES */}
      <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-pink-500">favorite</span> Hobi Lainnya
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {hobbies?.map((hobby: any) => (
            <div key={hobby.id} className="flex items-start gap-3 bg-black/20 p-4 rounded-xl border border-white/5 relative">
              <span className="material-symbols-outlined text-primary">{hobby.icon}</span>
              <div>
                <p className="text-white font-medium pr-16">{hobby.title}</p>
                <p className="text-xs text-gray-400 mt-1">{hobby.description}</p>
              </div>
              <form action={async () => { "use server"; await deleteHobby(hobby.id); }} className="absolute top-2 right-2">
                <button type="submit" className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded hover:bg-red-400/20">Hapus</button>
              </form>
            </div>
          ))}
          {(!hobbies || hobbies.length === 0) && <p className="text-sm text-gray-500">Belum ada data hobi.</p>}
        </div>

        <form action={addHobby} className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Icon (Material Symbols)</label>
            <input type="text" name="icon" required placeholder="Contoh: headphones" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
            <a href="https://fonts.google.com/icons" target="_blank" className="text-[10px] text-blue-400 hover:underline">Lihat referensi icon disini</a>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Judul Hobi</label>
            <input type="text" name="title" required className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Deskripsi</label>
            <textarea name="description" rows={2} required className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Link Tujuan (Opsional)</label>
            <input type="text" name="link" placeholder="/halaman-lain" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
          </div>
          <div className="flex items-end gap-3">
            <div className="w-24">
              <label className="block text-xs text-gray-400 mb-1">Urutan</label>
              <input type="number" name="order_idx" defaultValue="0" className="w-full text-sm bg-black/20 border border-white/10 rounded-md p-2 text-white" />
            </div>
            <button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-md font-medium text-sm transition-all h-[38px]">Tambah Hobi</button>
          </div>
        </form>
      </section>

    </div>
  );
}
