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
      <main className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-margin-desktop max-w-container-max mx-auto space-y-20 md:space-y-[120px]">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 mt-8 md:mt-12 mb-20 md:mb-32 text-center md:text-left" id="hero">
          <div className="flex-1 space-y-6 z-10 flex flex-col items-center md:items-start">
            <h1 className="font-display text-[48px] md:text-[72px] lg:text-[88px] uppercase tracking-[4px] text-text-primary leading-[1.1] hover:text-secondary hover:scale-105 origin-center md:origin-left transition-all duration-300 cursor-default">
              {heroTitle}
            </h1>
            <p className="font-body-md text-body-md text-text-secondary max-w-xl hover:text-secondary hover:scale-105 origin-center md:origin-left inline-block transition-all duration-300 cursor-default">
              {heroSubtitle}
            </p>
            <div className="flex gap-4 pt-4 justify-center md:justify-start">
              <a className="w-12 h-12 rounded-full border border-primary flex items-center justify-center hover:bg-secondary hover:text-on-secondary hover:border-secondary hover:scale-110 transition-all duration-300 text-primary" href={githubUrl} target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined">code</span>
              </a>
              <a className="w-12 h-12 rounded-full border border-primary flex items-center justify-center hover:bg-secondary hover:text-on-secondary hover:border-secondary hover:scale-110 transition-all duration-300 text-primary" href={linkedinUrl} target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined">work</span>
              </a>
            </div>
          </div>
          <div className="flex-1 relative flex justify-center mt-10 md:mt-0">
            <img 
              alt="Profile" 
              className="relative z-10 rounded-none object-cover w-full max-h-[400px] md:max-h-[700px] grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105" 
              src={heroImage}
            />
          </div>
        </section>

        {/* Motto Section */}
        <section className="bg-background border-l-2 md:border-l border-outline-variant p-6 md:p-12 max-w-3xl mx-auto hover:border-secondary transition-all duration-300 transform hover:scale-105 group mb-20 md:mb-32">
          <p className="font-body-md text-[16px] md:text-body-md text-text-primary italic group-hover:text-secondary transition-colors text-center md:text-left">
            {motto}
          </p>
        </section>

        {/* About Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-20 md:mb-32 text-center md:text-left" id="about">
          <div>
            <h2 className="inline-block font-display text-[32px] md:text-display-lg uppercase tracking-[3px] text-text-primary mb-6 md:mb-8 hover:text-secondary hover:scale-105 origin-center md:origin-left transition-all duration-300 cursor-default">{dict.portfolio.about.title}</h2>
            <div className="space-y-4 md:space-y-6 font-body-md text-[16px] md:text-body-md text-text-secondary">
              {aboutParagraphs.map((text: string, i: number) => (
                <p key={i} className="hover:text-secondary hover:scale-105 origin-center md:origin-left inline-block transition-all duration-300 cursor-default">{text}</p>
              ))}
            </div>
          </div>
          <div className="bg-surface-container border border-outline rounded-none p-6 md:p-12 h-full flex flex-col justify-center hover:border-secondary transition-colors mt-8 md:mt-0">
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <div className="border border-outline-variant p-4 md:p-6 rounded-none text-center hover:border-secondary group transition-all duration-300 transform hover:scale-105 cursor-default flex flex-col items-center justify-center">
                <span className="block font-display text-[36px] md:text-[48px] text-primary group-hover:text-secondary group-hover:scale-110 origin-bottom transition-all duration-300 mb-2 leading-none">{yearsExp}</span>
                <span className="block font-label-md uppercase tracking-[1px] md:tracking-[2px] text-[10px] md:text-[11px] text-text-secondary group-hover:text-secondary group-hover:scale-105 origin-top transition-all duration-300">{dict.portfolio.stats.experience}</span>
              </div>
              <div className="border border-outline-variant p-4 md:p-6 rounded-none text-center hover:border-secondary group transition-all duration-300 transform hover:scale-105 cursor-default flex flex-col items-center justify-center">
                <span className="block font-display text-[36px] md:text-[48px] text-primary group-hover:text-secondary group-hover:scale-110 origin-bottom transition-all duration-300 mb-2 leading-none">{projCompleted}</span>
                <span className="block font-label-md uppercase tracking-[1px] md:tracking-[2px] text-[10px] md:text-[11px] text-text-secondary group-hover:text-secondary group-hover:scale-105 origin-top transition-all duration-300">{dict.portfolio.stats.projects}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="mb-20 md:mb-32">
          <div className="text-center w-full"><h2 className="inline-block font-display text-[32px] md:text-display-lg uppercase tracking-[3px] text-text-primary mb-8 md:mb-12 text-center hover:text-secondary hover:scale-105 transition-all duration-300 cursor-default">{dict.portfolio.skills.title}</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-8 md:gap-y-10 max-w-4xl mx-auto px-4 md:px-0">
            {skills.map((skill) => (
              <div key={skill.name} className="space-y-4 group cursor-default transition-all duration-300 transform hover:scale-105">
                <div className="flex justify-between font-label-md uppercase tracking-[2px] text-[12px] text-text-primary group-hover:text-secondary transition-colors">
                  <span className="group-hover:scale-105 origin-left transition-all duration-300 inline-block">{skill.name}</span>
                  <span className="text-text-secondary group-hover:text-secondary group-hover:scale-110 transition-all duration-300 inline-block">{skill.percentage}</span>
                </div>
                <div className="h-1 w-full bg-surface-container rounded-none overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-1000 group-hover:bg-secondary" style={{ width: skill.percentage }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline / Education & Experience Section */}
        <section id="timeline" className="mb-20 md:mb-32">
          <div className="text-center w-full"><h2 className="inline-block font-display text-[32px] md:text-display-lg uppercase tracking-[3px] text-text-primary mb-10 md:mb-16 text-center hover:text-secondary hover:scale-105 transition-all duration-300 cursor-default">{dict.navbar.pengalaman}</h2></div>
          <div className="relative border-l border-outline-variant ml-2 md:mx-auto max-w-3xl space-y-8 md:space-y-12">
            {experiences.map((exp, idx) => (
              <div key={idx} className="relative pl-8 md:pl-12 pb-8 md:pb-12 border-b border-outline last:border-0 last:pb-0">
                <div className="absolute w-2 h-2 rounded-none bg-primary -left-[4px] top-2"></div>
                <div className="bg-transparent group transition-all duration-300 transform hover:scale-105 origin-left">
                  <span className="font-label-md uppercase tracking-[2px] text-[10px] md:text-[11px] text-text-secondary mb-2 md:mb-4 block group-hover:text-secondary group-hover:scale-105 origin-left transition-all duration-300">{exp.period}</span>
                  <h3 className="font-display text-[20px] md:text-[24px] uppercase tracking-[1px] md:tracking-[1.5px] text-text-primary mb-2 group-hover:text-secondary group-hover:scale-105 origin-left block transition-all duration-300">{exp.title}</h3>
                  <p className="font-body-md text-[14px] md:text-[16px] text-text-secondary group-hover:text-secondary group-hover:scale-105 origin-left block transition-all duration-300">{exp.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects & Certifications Grid */}
        <section id="projects" className="mb-20 md:mb-32">
          <div className="text-center w-full"><h2 className="inline-block font-display text-[32px] md:text-display-lg uppercase tracking-[3px] text-text-primary mb-10 md:mb-16 text-center hover:text-secondary hover:scale-105 transition-all duration-300 cursor-default">{dict.portfolio.projects.title}</h2></div>
          <ProjectGrid 
            items={projects.map(p => ({ type: p.type, title: p.title, desc: p.description, image: p.image, link: p.link }))}
            filterAllStr={dict.portfolio.projects.filterAll}
            filterProjectStr={dict.portfolio.projects.filterProject}
            filterCertStr={dict.portfolio.projects.filterCert}
          />
        </section>

        {/* Hobbies Section */}
        <section id="hobbies" className="mb-20 md:mb-32">
          <div className="text-center w-full"><h2 className="inline-block font-display text-[32px] md:text-display-lg uppercase tracking-[3px] text-text-primary mb-10 md:mb-16 text-center hover:text-secondary hover:scale-105 transition-all duration-300 cursor-default">{dict.portfolio.hobbies.title}</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {hobbies.map((h, i) => (
              <a href={h.link || '#'} key={i} className="bg-surface-container border border-outline p-6 md:p-10 rounded-none text-center hover:border-secondary transition-all duration-300 transform hover:scale-105 cursor-pointer group block">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-transparent border border-outline flex items-center justify-center mb-6 md:mb-8 group-hover:border-secondary transition-colors rounded-none">
                  <span className="material-symbols-outlined text-2xl md:text-3xl text-primary group-hover:text-secondary transition-colors">{h.icon}</span>
                </div>
                <h3 className="font-display text-[20px] md:text-[24px] uppercase tracking-[1px] md:tracking-[1.5px] text-text-primary mb-3 md:mb-4 group-hover:text-secondary transition-colors">{h.title}</h3>
                <p className="font-body-md text-[14px] md:text-[16px] text-text-secondary group-hover:text-secondary transition-colors">{h.description}</p>
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background py-16 border-t border-outline w-full">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-margin-desktop max-w-container-max mx-auto gap-8">
          <div className="font-display text-[14px] tracking-[6px] uppercase text-text-primary">
            EGI DANUAJISANTOSO
          </div>
          <div className="font-body-sm text-text-secondary text-center uppercase">
            {dict.footer.copyright}
          </div>
          <div className="flex gap-6 font-label-md uppercase tracking-[2px] text-[11px] text-text-secondary">
            <a className="hover:text-secondary hover:scale-110 inline-block transition-all duration-300" href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>
            <a className="hover:text-secondary hover:scale-110 inline-block transition-all duration-300" href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>

      <SpotifyFloating />
      <AIChatBot lang={lang} dict={dict.chatbot} />
    </>
  );
}
