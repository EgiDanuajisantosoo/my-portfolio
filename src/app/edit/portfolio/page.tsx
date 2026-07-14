import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { authenticate, logout, updateProfile, addSkill, updateSkill, deleteSkill, addExperience, updateExperience, deleteExperience, addProject, updateProject, deleteProject, addHobby, updateHobby, deleteHobby } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PortfolioEditPage() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("portfolio_admin_auth")?.value === "true";

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 font-sans text-on-surface">
        <div className="w-full max-w-md bg-surface-container/50 border border-white/10 rounded-2xl p-8 glass-panel shadow-2xl">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-5xl text-primary mb-4">admin_panel_settings</span>
            <h1 className="text-3xl font-display-sm text-white mb-2">Admin Portfolio</h1>
            <p className="text-text-secondary text-sm">Silakan masuk untuk mengedit konten portofolio Anda.</p>
          </div>
          <form action={authenticate} className="space-y-6">
            <div>
              <label className="block text-sm font-label-md text-text-secondary mb-2">Username</label>
              <input 
                type="text" 
                name="username" 
                required 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Masukkan username"
              />
            </div>
            <div>
              <label className="block text-sm font-label-md text-text-secondary mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Masukkan password"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-4 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              Masuk
              <span className="material-symbols-outlined text-[20px]">login</span>
            </button>
          </form>
          <div className="mt-6 text-center">
             <Link href="/portfolio" className="text-text-secondary hover:text-white text-sm transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Kembali ke Portofolio
             </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Fetch Data ---
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase.from("portfolio_profile").select("*").eq("id", 1).single();
  const { data: skills } = await supabase.from("portfolio_skills").select("*").order("order_idx");
  const { data: experiences } = await supabase.from("portfolio_experiences").select("*").order("order_idx");
  const { data: projects } = await supabase.from("portfolio_projects").select("*").order("order_idx");
  const { data: hobbies } = await supabase.from("portfolio_hobbies").select("*").order("order_idx");

  let aboutTextStr = "";
  try {
    if (Array.isArray(profile?.about_text)) {
      aboutTextStr = profile.about_text.join('\n\n');
    } else if (profile?.about_text) {
      aboutTextStr = JSON.parse(profile.about_text).join('\n\n');
    }
  } catch (e) {
    aboutTextStr = typeof profile?.about_text === 'string' ? profile.about_text : "";
  }

  let aboutTextEnStr = "";
  try {
    if (Array.isArray(profile?.about_text_en)) {
      aboutTextEnStr = profile.about_text_en.join('\n\n');
    } else if (profile?.about_text_en) {
      aboutTextEnStr = JSON.parse(profile.about_text_en).join('\n\n');
    }
  } catch (e) {
    aboutTextEnStr = typeof profile?.about_text_en === 'string' ? profile.about_text_en : "";
  }

  const sectionClasses = "bg-surface-container/30 border border-white/10 rounded-2xl p-6 glass-panel mb-8";
  const labelClasses = "block text-sm font-label-md text-text-secondary mb-1";
  const inputClasses = "w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary transition-all";
  const btnSubmitClasses = "bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 active:scale-95 transition-all";
  const btnDeleteClasses = "bg-error/20 text-error border border-error/50 px-4 py-2 rounded-lg font-bold text-sm hover:bg-error/30 active:scale-95 transition-all";

  return (
    <div className="min-h-screen bg-surface text-on-surface p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-display-sm text-white mb-1">Dashboard Portofolio</h1>
            <p className="text-text-secondary text-sm">Kelola konten portofolio Anda secara real-time.</p>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/portfolio" className="text-primary hover:underline text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">visibility</span> Lihat Portofolio
            </Link>
            <form action={logout}>
              <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">logout</span> Keluar
              </button>
            </form>
          </div>
        </header>

        {/* 1. PROFILE SECTION */}
        <details className="group mb-4" open>
          <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <h2 className="text-xl font-headline-sm text-white flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">person</span> 1. Profil Utama
            </h2>
            <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div className={`${sectionClasses} mt-4`}>
            <form action={updateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID */}
                <div className="space-y-4">
                  <h3 className="text-primary font-bold border-b border-white/10 pb-2">Bahasa Indonesia (ID)</h3>
                  <div>
                    <label className={labelClasses}>Hero Title</label>
                    <input type="text" name="hero_title" defaultValue={profile?.hero_title} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Hero Subtitle</label>
                    <textarea name="hero_subtitle" defaultValue={profile?.hero_subtitle} className={`${inputClasses} h-20`} />
                  </div>
                  <div>
                    <label className={labelClasses}>Motto</label>
                    <textarea name="motto" defaultValue={profile?.motto} className={`${inputClasses} h-20`} />
                  </div>
                  <div>
                    <label className={labelClasses}>About Text (Paragraf, pisahkan dengan Enter)</label>
                    <textarea name="about_text" defaultValue={aboutTextStr} className={`${inputClasses} h-40`} />
                  </div>
                </div>
                {/* EN */}
                <div className="space-y-4">
                  <h3 className="text-secondary font-bold border-b border-white/10 pb-2">English (EN)</h3>
                  <div>
                    <label className={labelClasses}>Hero Title (EN)</label>
                    <input type="text" name="hero_title_en" defaultValue={profile?.hero_title_en} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Hero Subtitle (EN)</label>
                    <textarea name="hero_subtitle_en" defaultValue={profile?.hero_subtitle_en} className={`${inputClasses} h-20`} />
                  </div>
                  <div>
                    <label className={labelClasses}>Motto (EN)</label>
                    <textarea name="motto_en" defaultValue={profile?.motto_en} className={`${inputClasses} h-20`} />
                  </div>
                  <div>
                    <label className={labelClasses}>About Text EN (Paragraphs, separate with Enter)</label>
                    <textarea name="about_text_en" defaultValue={aboutTextEnStr} className={`${inputClasses} h-40`} />
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Hero Image Path</label>
                  <input type="text" name="hero_image" defaultValue={profile?.hero_image} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Github URL</label>
                  <input type="text" name="github_url" defaultValue={profile?.github_url} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>LinkedIn URL</label>
                  <input type="text" name="linkedin_url" defaultValue={profile?.linkedin_url} className={inputClasses} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className={labelClasses}>Years Exp.</label>
                    <input type="text" name="years_experience" defaultValue={profile?.years_experience} className={inputClasses} />
                  </div>
                  <div className="flex-1">
                    <label className={labelClasses}>Projects</label>
                    <input type="text" name="projects_completed" defaultValue={profile?.projects_completed} className={inputClasses} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className={btnSubmitClasses}>Simpan Profil</button>
              </div>
            </form>
          </div>
        </details>

        {/* 2. SKILLS SECTION */}
        <details className="group mb-4">
          <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <h2 className="text-xl font-headline-sm text-white flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">code</span> 2. Keahlian (Skills)
            </h2>
            <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div className={`${sectionClasses} mt-4`}>
            {/* List Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {skills?.map((skill) => (
                <div key={skill.id} className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <form className="flex flex-col gap-3">
                    <input type="hidden" name="id" value={skill.id} />
                    <div className="flex gap-2">
                       <input type="text" name="name" defaultValue={skill.name} className={inputClasses} placeholder="Nama (ex: Laravel)" />
                       <input type="text" name="percentage" defaultValue={skill.percentage} className={`${inputClasses} w-24`} placeholder="80%" />
                       <input type="number" name="order_idx" defaultValue={skill.order_idx} className={`${inputClasses} w-16`} title="Urutan" />
                    </div>
                    <div className="flex justify-between">
                      <button formAction={deleteSkill} className={btnDeleteClasses}>Hapus</button>
                      <button formAction={updateSkill} className={btnSubmitClasses}>Update</button>
                    </div>
                  </form>
                </div>
              ))}
            </div>
            {/* Add Skill */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="font-bold mb-4 text-white">Tambah Keahlian Baru</h3>
              <form action={addSkill} className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className={labelClasses}>Nama Keahlian</label>
                  <input type="text" name="name" className={inputClasses} required />
                </div>
                <div className="w-24">
                  <label className={labelClasses}>Persentase</label>
                  <input type="text" name="percentage" className={inputClasses} placeholder="ex: 80%" required />
                </div>
                <div className="w-16">
                  <label className={labelClasses}>Urutan</label>
                  <input type="number" name="order_idx" defaultValue={0} className={inputClasses} />
                </div>
                <button type="submit" className={btnSubmitClasses}>Tambah</button>
              </form>
            </div>
          </div>
        </details>

        {/* 3. EXPERIENCES SECTION */}
        <details className="group mb-4">
          <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <h2 className="text-xl font-headline-sm text-white flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">work</span> 3. Pengalaman
            </h2>
            <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div className={`${sectionClasses} mt-4`}>
            {experiences?.map((exp) => (
              <div key={exp.id} className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                <form className="flex flex-col gap-4">
                  <input type="hidden" name="id" value={exp.id} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className={labelClasses}>Judul (ID) & Urutan</label>
                        <div className="flex gap-2">
                           <input type="text" name="title" defaultValue={exp.title} className={inputClasses} placeholder="Title ID" />
                           <input type="number" name="order_idx" defaultValue={exp.order_idx} className={`${inputClasses} w-16`} />
                        </div>
                        <label className={labelClasses}>Subjudul (ID)</label>
                        <input type="text" name="subtitle" defaultValue={exp.subtitle} className={inputClasses} />
                        <label className={labelClasses}>Periode (ID)</label>
                        <input type="text" name="period" defaultValue={exp.period} className={inputClasses} />
                     </div>
                     <div className="space-y-2 border-l border-white/5 pl-4">
                        <label className={labelClasses}>Title (EN)</label>
                        <input type="text" name="title_en" defaultValue={exp.title_en} className={inputClasses} />
                        <label className={labelClasses}>Subtitle (EN)</label>
                        <input type="text" name="subtitle_en" defaultValue={exp.subtitle_en} className={inputClasses} />
                        <label className={labelClasses}>Period (EN)</label>
                        <input type="text" name="period_en" defaultValue={exp.period_en} className={inputClasses} />
                     </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-white/5">
                    <button formAction={deleteExperience} className={btnDeleteClasses}>Hapus</button>
                    <button formAction={updateExperience} className={btnSubmitClasses}>Update</button>
                  </div>
                </form>
              </div>
            ))}
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="font-bold mb-4 text-white">Tambah Pengalaman Baru</h3>
              <form action={addExperience} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={labelClasses}>Judul (ID)</label>
                    <input type="text" name="title" className={inputClasses} required />
                    <label className={labelClasses}>Subjudul (ID)</label>
                    <input type="text" name="subtitle" className={inputClasses} />
                    <label className={labelClasses}>Periode (ID)</label>
                    <input type="text" name="period" className={inputClasses} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClasses}>Title (EN)</label>
                    <input type="text" name="title_en" className={inputClasses} />
                    <label className={labelClasses}>Subtitle (EN)</label>
                    <input type="text" name="subtitle_en" className={inputClasses} />
                    <label className={labelClasses}>Period (EN)</label>
                    <div className="flex gap-2">
                      <input type="text" name="period_en" className={inputClasses} />
                      <input type="number" name="order_idx" defaultValue={0} placeholder="Urutan" className={`${inputClasses} w-16`} />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" className={btnSubmitClasses}>Tambah</button>
                  </div>
              </form>
            </div>
          </div>
        </details>

        {/* 4. PROJECTS SECTION */}
        <details className="group mb-4">
          <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <h2 className="text-xl font-headline-sm text-white flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">folder</span> 4. Projects
            </h2>
            <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div className={`${sectionClasses} mt-4`}>
            {projects?.map((proj) => (
              <div key={proj.id} className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                <form className="flex flex-col gap-4">
                  <input type="hidden" name="id" value={proj.id} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className={labelClasses}>Judul (ID) & Urutan</label>
                        <div className="flex gap-2">
                           <input type="text" name="title" defaultValue={proj.title} className={inputClasses} />
                           <input type="number" name="order_idx" defaultValue={proj.order_idx} className={`${inputClasses} w-16`} />
                        </div>
                        <label className={labelClasses}>Deskripsi (ID)</label>
                        <textarea name="description" defaultValue={proj.description} className={`${inputClasses} h-20`} />
                     </div>
                     <div className="space-y-2 border-l border-white/5 pl-4">
                        <label className={labelClasses}>Title (EN)</label>
                        <input type="text" name="title_en" defaultValue={proj.title_en} className={inputClasses} />
                        <label className={labelClasses}>Description (EN)</label>
                        <textarea name="description_en" defaultValue={proj.description_en} className={`${inputClasses} h-20`} />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                     <div>
                        <label className={labelClasses}>Tipe</label>
                        <input type="text" name="type" defaultValue={proj.type} className={inputClasses} placeholder="ex: project / web / app" />
                     </div>
                     <div>
                        <label className={labelClasses}>Image URL</label>
                        <input type="text" name="image" defaultValue={proj.image} className={inputClasses} />
                     </div>
                     <div>
                        <label className={labelClasses}>Link URL</label>
                        <input type="text" name="link" defaultValue={proj.link} className={inputClasses} />
                     </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-white/5">
                    <button formAction={deleteProject} className={btnDeleteClasses}>Hapus</button>
                    <button formAction={updateProject} className={btnSubmitClasses}>Update</button>
                  </div>
                </form>
              </div>
            ))}
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="font-bold mb-4 text-white">Tambah Project Baru</h3>
              <form action={addProject} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className={labelClasses}>Judul (ID)</label>
                        <input type="text" name="title" className={inputClasses} required />
                        <label className={labelClasses}>Deskripsi (ID)</label>
                        <textarea name="description" className={`${inputClasses} h-20`} />
                     </div>
                     <div className="space-y-2">
                        <label className={labelClasses}>Title (EN)</label>
                        <input type="text" name="title_en" className={inputClasses} />
                        <label className={labelClasses}>Description (EN)</label>
                        <textarea name="description_en" className={`${inputClasses} h-20`} />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                     <div>
                        <label className={labelClasses}>Tipe</label>
                        <input type="text" name="type" defaultValue="project" className={inputClasses} />
                     </div>
                     <div>
                        <label className={labelClasses}>Image URL</label>
                        <input type="text" name="image" defaultValue="/placeholder.jpg" className={inputClasses} />
                     </div>
                     <div>
                        <label className={labelClasses}>Link URL</label>
                        <input type="text" name="link" defaultValue="#" className={inputClasses} />
                     </div>
                     <div>
                        <label className={labelClasses}>Urutan</label>
                        <input type="number" name="order_idx" defaultValue={0} className={inputClasses} />
                     </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className={btnSubmitClasses}>Tambah</button>
                  </div>
              </form>
            </div>
          </div>
        </details>

        {/* 5. HOBBIES SECTION */}
        <details className="group mb-4">
          <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <h2 className="text-xl font-headline-sm text-white flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">favorite</span> 5. Hobi & Minat
            </h2>
            <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div className={`${sectionClasses} mt-4`}>
            {hobbies?.map((hobby) => (
              <div key={hobby.id} className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                <form className="flex flex-col gap-4">
                  <input type="hidden" name="id" value={hobby.id} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className={labelClasses}>Judul (ID)</label>
                        <input type="text" name="title" defaultValue={hobby.title} className={inputClasses} />
                        <label className={labelClasses}>Deskripsi (ID)</label>
                        <textarea name="description" defaultValue={hobby.description} className={`${inputClasses} h-20`} />
                     </div>
                     <div className="space-y-2 border-l border-white/5 pl-4">
                        <label className={labelClasses}>Title (EN)</label>
                        <input type="text" name="title_en" defaultValue={hobby.title_en} className={inputClasses} />
                        <label className={labelClasses}>Description (EN)</label>
                        <textarea name="description_en" defaultValue={hobby.description_en} className={`${inputClasses} h-20`} />
                     </div>
                  </div>
                  <div className="flex gap-4 items-end mt-2">
                    <div className="flex-1">
                      <label className={labelClasses}>Ikon (Material Symbols)</label>
                      <input type="text" name="icon" defaultValue={hobby.icon} className={inputClasses} />
                    </div>
                    <div className="flex-1">
                      <label className={labelClasses}>Link (Opsional)</label>
                      <input type="text" name="link" defaultValue={hobby.link || ''} className={inputClasses} />
                    </div>
                    <div className="w-16">
                      <label className={labelClasses}>Urutan</label>
                      <input type="number" name="order_idx" defaultValue={hobby.order_idx} className={inputClasses} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-white/5">
                    <button formAction={deleteHobby} className={btnDeleteClasses}>Hapus</button>
                    <button formAction={updateHobby} className={btnSubmitClasses}>Update</button>
                  </div>
                </form>
              </div>
            ))}
            <div className="border-t border-white/10 pt-6 mt-6">
               <h3 className="font-bold mb-4 text-white">Tambah Hobi Baru</h3>
               <form action={addHobby} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className={labelClasses}>Judul (ID)</label>
                        <input type="text" name="title" className={inputClasses} required />
                        <label className={labelClasses}>Deskripsi (ID)</label>
                        <textarea name="description" className={`${inputClasses} h-20`} />
                     </div>
                     <div className="space-y-2 border-l border-white/5 pl-4">
                        <label className={labelClasses}>Title (EN)</label>
                        <input type="text" name="title_en" className={inputClasses} />
                        <label className={labelClasses}>Description (EN)</label>
                        <textarea name="description_en" className={`${inputClasses} h-20`} />
                     </div>
                  </div>
                  <div className="flex gap-4 items-end mt-2">
                    <div className="flex-1">
                      <label className={labelClasses}>Ikon (Material Symbols)</label>
                      <input type="text" name="icon" className={inputClasses} placeholder="ex: headphones" required />
                    </div>
                    <div className="flex-1">
                      <label className={labelClasses}>Link (Opsional)</label>
                      <input type="text" name="link" className={inputClasses} />
                    </div>
                    <div className="w-16">
                      <label className={labelClasses}>Urutan</label>
                      <input type="number" name="order_idx" defaultValue={0} className={inputClasses} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className={btnSubmitClasses}>Tambah</button>
                  </div>
               </form>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
