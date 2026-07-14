import React from 'react';
import { createClient } from "@supabase/supabase-js";
import { AIChatBot } from '@/components/AIChatBot';
import ProjectGrid from '@/components/ProjectGrid';
import SpotifyFloating from '@/components/SpotifyFloating';
import { cookies } from 'next/headers';
import { getDictionary, Language } from '@/i18n/dictionaries';

export const dynamic = "force-dynamic";

export default async function Portfolio() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('NEXT_LOCALE')?.value || 'id') as Language;
  const dict = getDictionary(lang);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch Data (with fallback to default if table is empty or error)
  const { data: profile } = await supabase.from('portfolio_profile').select('*').eq('id', 1).single();
  const { data: skillsData } = await supabase.from('portfolio_skills').select('*').order('order_idx');
  const { data: expData } = await supabase.from('portfolio_experiences').select('*').order('order_idx');
  const { data: projectsData } = await supabase.from('portfolio_projects').select('*').order('order_idx');
  const { data: hobbiesData } = await supabase.from('portfolio_hobbies').select('*').order('order_idx');

  const isEn = lang === 'en';

  const heroTitle = (isEn && profile?.hero_title_en) ? profile.hero_title_en : (profile?.hero_title || dict.portfolio.greeting);
  const heroSubtitle = (isEn && profile?.hero_subtitle_en) ? profile.hero_subtitle_en : (profile?.hero_subtitle || dict.portfolio.description);
  const heroImage = profile?.hero_image || '/images/me.png';
  const githubUrl = profile?.github_url || 'https://github.com/EgiDanuajisantosoo';
  const linkedinUrl = profile?.linkedin_url || 'https://www.linkedin.com/in/egi-danuajisantoso';
  const motto = (isEn && profile?.motto_en) ? profile.motto_en : (profile?.motto || '“Hidup itu pilihan, jadi setiap keputusan yang Anda pilih akan menentukan kehidupan Anda dan setiap pilihan terkadang harus ada suatu hal yang dikorbankan...”');
  
  let aboutParagraphs: string[] = [];
  try {
    const rawAbout = (isEn && profile?.about_text_en) ? profile.about_text_en : profile?.about_text;
    if (Array.isArray(rawAbout)) {
      aboutParagraphs = rawAbout;
    } else {
      aboutParagraphs = rawAbout ? JSON.parse(rawAbout) : [
        "Saya adalah Egi Danuajisantoso seorang web developer yang bersemangat dan berdedikasi untuk terus berkembang dalam dunia pengembangan web. Saat ini, fokus utama saya adalah memperdalam keahlian dan mengoptimalkan penggunaan Laravel, framework PHP yang saya yakini sangat powerful dan efisien untuk membangun aplikasi web modern.",
        "Dengan pengalaman yang saya miliki dalam menggunakan Laravel, saya telah berhasil mengembangkan berbagai proyek, mulai dari aplikasi manajemen konten sederhana hingga sistem yang lumayan kompleks dengan integrasi API. Saya selalu berusaha untuk menulis kode yang bersih, terstruktur, dan mudah dipelihara, mengikuti praktik terbaik (best practices) dalam pengembangan perangkat lunak.",
        "Saya ingin bergabung dengan tim atau proyek yang memberikan kesempatan untuk belajar dari para ahli, berkolaborasi dalam solusi inovatif agar saya bisa mengukur kemampuan yang sudah saya pelajari."
      ];
    }
  } catch (e) {
    const rawAboutFallback = (isEn && profile?.about_text_en) ? profile.about_text_en : profile?.about_text;
    aboutParagraphs = Array.isArray(rawAboutFallback) ? rawAboutFallback : [typeof rawAboutFallback === 'string' ? rawAboutFallback : ''];
  }

  const yearsExp = profile?.years_experience || '3+';
  const projCompleted = profile?.projects_completed || '10+';

  const skills = skillsData && skillsData.length > 0 ? skillsData : [
    { name: 'Laravel (PHP)', percentage: '90%' },
    { name: 'Tailwind CSS', percentage: '95%' },
    { name: 'MySQL', percentage: '85%' },
  ];

  const experiences = expData && expData.length > 0 ? expData.map(e => ({
    ...e,
    title: (isEn && e.title_en) ? e.title_en : e.title,
    subtitle: (isEn && e.subtitle_en) ? e.subtitle_en : e.subtitle,
    period: (isEn && e.period_en) ? e.period_en : e.period
  })) : [
    { period: '2023 - Saat Ini', title: 'TELKOM UNIVERSITY', subtitle: 'D3 Rekayasa Perangkat Lunak Aplikasi' }
  ];

  const projects = projectsData && projectsData.length > 0 ? projectsData.map(p => ({
    ...p,
    title: (isEn && p.title_en) ? p.title_en : p.title,
    description: (isEn && p.description_en) ? p.description_en : p.description
  })) : [
    { type: 'project', title: 'Belum ada data', desc: 'Silakan isi data di database.', image: '/placeholder.jpg', link: '#' }
  ];

  const hobbies = hobbiesData && hobbiesData.length > 0 ? hobbiesData.map(h => ({
    ...h,
    title: (isEn && h.title_en) ? h.title_en : h.title,
    description: (isEn && h.description_en) ? h.description_en : h.description
  })) : [
    { icon: 'headphones', title: 'Mendengarkan Musik', description: 'Suka mendengarkan musik saat ngoding atau bersantai.', link: null },
    { icon: 'code', title: 'Ngoding & Eksperimen', description: 'Mencoba teknologi baru dan membuat mini project.', link: null },
    { icon: 'sports_esports', title: 'Gaming', description: 'Bermain game untuk refreshing di waktu senggang.', link: null },
    { icon: 'movie', title: 'Menonton Film / Series', description: 'Rehat sejenak dengan menonton film atau series.', link: null }
  ];

  return (
    <>
      <main className="pt-32 pb-24 px-4 md:px-margin-desktop max-w-container-max mx-auto space-y-[120px]">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 mt-12" id="hero">
          <div className="flex-1 space-y-6 z-10">
            <h1 className="font-display-lg text-display-lg md:font-display-lg-mobile md:text-display-lg-mobile text-text-primary">
              {heroTitle}
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary">
              {heroSubtitle}
            </p>
            <div className="flex gap-4 pt-4">
              <a className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:border-primary hover:text-primary transition-colors" href={githubUrl} target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined">code</span>
              </a>
              <a className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:border-primary hover:text-primary transition-colors" href={linkedinUrl} target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined">work</span>
              </a>
            </div>
          </div>
          <div className="flex-1 relative flex justify-center">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full w-3/4 h-3/4 m-auto"></div>
            <img 
              alt="Profile" 
              className="relative z-10 rounded-xl glass-panel object-cover max-h-[500px] border border-white/10 p-2" 
              src={heroImage}
            />
          </div>
        </section>

        {/* Motto Section */}
        <section className="glass-panel p-12 rounded-xl text-center max-w-3xl mx-auto border-l-4 border-l-primary">
          <span className="material-symbols-outlined text-4xl text-primary/50 mb-4 block">format_quote</span>
          <p className="font-headline-md text-headline-md text-text-primary italic">
            {motto}
          </p>
        </section>

        {/* About Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center" id="about">
          <div>
            <h2 className="font-display-lg text-display-lg text-text-primary mb-6">{dict.portfolio.about.title}</h2>
            <div className="space-y-4 font-body-lg text-body-lg text-text-secondary">
              {aboutParagraphs.map((text: string, i: number) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-xl p-8 h-full flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-4 rounded text-center">
                <span className="block font-headline-md text-headline-md text-primary">{yearsExp}</span>
                <span className="font-label-md text-label-md text-text-secondary">{dict.portfolio.stats.experience}</span>
              </div>
              <div className="glass-panel p-4 rounded text-center">
                <span className="block font-headline-md text-headline-md text-primary">{projCompleted}</span>
                <span className="font-label-md text-label-md text-text-secondary">{dict.portfolio.stats.projects}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills">
          <h2 className="font-display-lg text-display-lg text-text-primary mb-8 text-center">{dict.portfolio.skills.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
            {skills.map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex justify-between font-label-md text-label-md text-text-primary">
                  <span>{skill.name}</span>
                  <span className="text-primary">{skill.percentage}</span>
                </div>
                <div className="h-2 w-full bg-surface-raised rounded overflow-hidden border border-white/5">
                  <div className="skill-bar-fill" style={{ width: skill.percentage }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline / Education & Experience Section */}
        <section id="timeline">
          <h2 className="font-display-lg text-display-lg text-text-primary mb-12 text-center">{dict.navbar.pengalaman}</h2>
          <div className="relative border-l border-white/10 ml-4 md:mx-auto max-w-3xl space-y-12">
            {experiences.map((exp, idx) => (
              <div key={idx} className="relative pl-8">
                <div className={`absolute w-4 h-4 rounded-full -left-[8px] top-1 ${idx === 0 ? 'bg-primary border-4 border-background' : 'bg-surface-raised border border-primary'}`}></div>
                <div className="glass-panel p-6 rounded-xl hover:scale-[1.02] transition-transform">
                  <span className={`font-code text-code mb-2 block ${idx === 0 ? 'text-primary' : 'text-primary/70'}`}>{exp.period}</span>
                  <h3 className="font-headline-sm text-headline-sm text-text-primary">{exp.title}</h3>
                  <p className="font-body-md text-body-md text-text-secondary mt-2">{exp.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects & Certifications Grid */}
        <section id="projects">
          <h2 className="font-display-lg text-display-lg text-text-primary mb-8 text-center">{dict.portfolio.projects.title}</h2>
          <ProjectGrid 
            items={projects.map(p => ({ type: p.type, title: p.title, desc: p.description, image: p.image, link: p.link }))}
            filterAllStr={dict.portfolio.projects.filterAll}
            filterProjectStr={dict.portfolio.projects.filterProject}
            filterCertStr={dict.portfolio.projects.filterCert}
          />
        </section>

        {/* Hobbies Section */}
        <section id="hobbies">
          <h2 className="font-display-lg text-display-lg text-text-primary mb-8 text-center">{dict.portfolio.hobbies.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hobbies.map((h, i) => (
              <a href={h.link || '#'} key={i} className="glass-panel p-6 rounded-xl text-center hover:border-primary transition-colors cursor-pointer group block">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-primary">{h.icon}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">{h.title}</h3>
                <p className="font-body-md text-body-md text-text-secondary">{h.description}</p>
              </a>
            ))}
            
            {/* Dynamic Hobby Pages Hardcoded */}
            <a href="/mylist/anime" className="glass-panel p-6 rounded-xl text-center hover:border-primary transition-colors cursor-pointer group block">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary">animation</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">{dict.portfolio.hobbies.anime}</h3>
              <p className="font-body-md text-body-md text-text-secondary">{dict.portfolio.hobbies.seeAnime}</p>
            </a>
            
            <a href="/mylist/buku" className="glass-panel p-6 rounded-xl text-center hover:border-primary transition-colors cursor-pointer group block">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary">menu_book</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">{dict.portfolio.hobbies.book}</h3>
              <p className="font-body-md text-body-md text-text-secondary">{dict.portfolio.hobbies.seeBooks}</p>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-white/10 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-margin-desktop max-w-container-max mx-auto gap-base">
          <div className="font-headline-sm text-headline-sm text-primary">
            EGI DANUAJISANTOSO
          </div>
          <div className="font-label-md text-label-md text-text-secondary text-center">
            © 2024 EGI DANUAJISANTOSO. ENGINEERED FOR PERFORMANCE.
          </div>
          <div className="flex gap-4 font-label-md text-label-md text-text-secondary mt-4 md:mt-0">
            <a className="hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-200" href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>
            <a className="hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-200" href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>

      <SpotifyFloating />
      <AIChatBot lang={lang} dict={dict.chatbot} />
    </>
  );
}
