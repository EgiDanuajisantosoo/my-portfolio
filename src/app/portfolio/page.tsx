'use client';

import React, { useState } from 'react';
import { SpotifyCurrentTrack } from '@/components/SpotifyCurrentTrack';
import { AIChatBot } from '@/components/AIChatBot';

export default function Portfolio() {
  const [filter, setFilter] = useState<'all' | 'project' | 'certificate'>('all');
  const [isSpotifyOpen, setIsSpotifyOpen] = useState(false);

  const items = [
    {
      type: 'project',
      title: 'Website KontrakanKita',
      desc: 'Teknologi: Laravel 12, MySQL, Google Client API (OAuth 2.0), Pusher,Tailwind',
      image: '/proyek/kontrakanKita1.png',
      link: 'https://github.com/EgiDanuajisantosoo/KontrakanKita',
    },
    {
      type: 'project',
      title: 'Website UsahaKita',
      desc: 'Teknologi: Laravel 11, MySQL,fillament, Tailwind',
      image: '/proyek/usahaKita1.png',
      link: 'https://github.com/EgiDanuajisantosoo/pbw2_Tubes_UsahaKita',
    },
    {
      type: 'project',
      title: 'Website Rental Mobil',
      desc: 'Tailwind,JavaScript,HTML,CSS,Aos.js',
      image: '/proyek/rentCar1.png',
      link: 'https://github.com/EgiDanuajisantosoo/RentCar',
    },
    {
      type: 'certificate',
      title: 'Sertifikat Junior Web Developer',
      desc: 'Dari Badan Nasional Sertifikasi Profesi.',
      image: '/sertifikasi/juniorWebDev.png',
      link: '/sertifikasi/juniorWebDev.png',
    },
    {
      type: 'certificate',
      title: 'Sertifikat Office Application',
      desc: 'Dari Badan Nasional Sertifikasi Profesi.',
      image: '/sertifikasi/OfficeApplication.png',
      link: '/sertifikasi/OfficeApplication.png',
    }
  ];

  const filteredItems = filter === 'all' ? items : items.filter((item) => item.type === filter);

  return (
    <>
      <main className="pt-32 pb-24 px-4 md:px-margin-desktop max-w-container-max mx-auto space-y-[120px]">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 mt-12" id="hero">
          <div className="flex-1 space-y-6 z-10">
            <h1 className="font-display-lg text-display-lg md:font-display-lg-mobile md:text-display-lg-mobile text-text-primary">
              Selamat Datang di Web Portfolio Saya
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary">
              Ini adalah halaman Portfolio saya yang sederhana. Fullstack Developer / Laravel.
            </p>
            <div className="flex gap-4 pt-4">
              <a className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:border-primary hover:text-primary transition-colors" href="#">
                <span className="material-symbols-outlined">link</span>
              </a>
              <a className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:border-primary hover:text-primary transition-colors" href="https://github.com/EgiDanuajisantosoo" target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined">code</span>
              </a>
              <a className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:border-primary hover:text-primary transition-colors" href="https://www.linkedin.com/in/egi-danuajisantoso" target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined">work</span>
              </a>
            </div>
          </div>
          <div className="flex-1 relative flex justify-center">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full w-3/4 h-3/4 m-auto"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="Egi Profile" 
              className="relative z-10 rounded-xl glass-panel object-cover max-h-[500px] border border-white/10 p-2" 
              src="/images/me.png"
            />
          </div>
        </section>

        {/* Motto Section */}
        <section className="glass-panel p-12 rounded-xl text-center max-w-3xl mx-auto border-l-4 border-l-primary">
          <span className="material-symbols-outlined text-4xl text-primary/50 mb-4 block">format_quote</span>
          <p className="font-headline-md text-headline-md text-text-primary italic">
            “Hidup itu pilihan, jadi setiap keputusan yang Anda pilih akan menentukan kehidupan Anda dan setiap pilihan terkadang harus ada suatu hal yang dikorbankan...”
          </p>
        </section>

        {/* About Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center" id="about">
          <div>
            <h2 className="font-display-lg text-display-lg text-text-primary mb-6">Tentang Saya</h2>
            <div className="space-y-4 font-body-lg text-body-lg text-text-secondary">
              <p>
                Saya adalah Egi Danuajisantoso seorang web developer yang bersemangat dan berdedikasi untuk terus berkembang dalam dunia pengembangan web. Saat ini, fokus utama saya adalah memperdalam keahlian dan mengoptimalkan penggunaan Laravel, framework PHP yang saya yakini sangat powerful dan efisien untuk membangun aplikasi web modern.
              </p>
              <p>
                Dengan pengalaman yang saya miliki dalam menggunakan Laravel, saya telah berhasil mengembangkan berbagai proyek, mulai dari aplikasi manajemen konten sederhana hingga sistem yang lumayan kompleks dengan integrasi API. Saya selalu berusaha untuk menulis kode yang bersih, terstruktur, dan mudah dipelihara, mengikuti praktik terbaik (best practices) dalam pengembangan perangkat lunak.
              </p>
              <p>
                Saya ingin bergabung dengan tim atau proyek yang memberikan kesempatan untuk belajar dari para ahli, berkolaborasi dalam solusi inovatif agar saya bisa mengukur kemampuan yang sudah saya pelajari.
              </p>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-8 h-full flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-4 rounded text-center">
                <span className="block font-headline-md text-headline-md text-primary">3+</span>
                <span className="font-label-md text-label-md text-text-secondary">Years Experience</span>
              </div>
              <div className="glass-panel p-4 rounded text-center">
                <span className="block font-headline-md text-headline-md text-primary">10+</span>
                <span className="font-label-md text-label-md text-text-secondary">Projects Completed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills">
          <h2 className="font-display-lg text-display-lg text-text-primary mb-8 text-center">Keahlian</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
            {[
              { name: 'Laravel', percentage: '90%' },
              { name: 'PHP', percentage: '80%' },
              { name: 'MySQL', percentage: '85%' },
              { name: 'JavaScript', percentage: '75%' },
              { name: 'Tailwind CSS', percentage: '95%' },
              { name: 'HTML5 & CSS3', percentage: '95%' },
              { name: 'NextJS', percentage: '50%' },
            ].map((skill) => (
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
          <h2 className="font-display-lg text-display-lg text-text-primary mb-12 text-center">Pendidikan &amp; Pengalaman</h2>
          <div className="relative border-l border-white/10 ml-4 md:mx-auto max-w-3xl space-y-12">
            <div className="relative pl-8">
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-[8px] top-1 border-4 border-background"></div>
              <div className="glass-panel p-6 rounded-xl hover:scale-[1.02] transition-transform">
                <span className="font-code text-code text-primary mb-2 block">2023 - Saat Ini</span>
                <h3 className="font-headline-sm text-headline-sm text-text-primary">TELKOM UNIVERSITY</h3>
                <p className="font-body-md text-body-md text-text-secondary mt-2">D3 Rekayasa Perangkat Lunak Aplikasi</p>
              </div>
            </div>
            <div className="relative pl-8">
              <div className="absolute w-4 h-4 bg-surface-raised border border-primary rounded-full -left-[8px] top-1"></div>
              <div className="glass-panel p-6 rounded-xl hover:scale-[1.02] transition-transform">
                <span className="font-code text-code text-primary/70 mb-2 block">2020 - 2023</span>
                <h3 className="font-headline-sm text-headline-sm text-text-primary">SMK TELEKOMUNIKASI TUNAS HARAPAN</h3>
                <p className="font-body-md text-body-md text-text-secondary mt-2">Rekayasa Perangkat Lunak</p>
              </div>
            </div>
            <div className="relative pl-8">
              <div className="absolute w-4 h-4 bg-surface-raised border border-primary rounded-full -left-[8px] top-1"></div>
              <div className="glass-panel p-6 rounded-xl hover:scale-[1.02] transition-transform">
                <span className="font-code text-code text-primary/70 mb-2 block">Magang 3 Bulan (Saat SMK)</span>
                <h3 className="font-headline-sm text-headline-sm text-text-primary">PT. Adhikari Inovasi Indonesia</h3>
                <p className="font-body-md text-body-md text-text-secondary mt-2">Internship</p>
              </div>
            </div>
          </div>
        </section>

        {/* Projects & Certifications Grid */}
        <section id="projects">
          <h2 className="font-display-lg text-display-lg text-text-primary mb-8 text-center">Project &amp; Sertifikasi</h2>
          
          <div className="flex justify-center gap-4 mb-8">
            <button
              className={`px-4 py-2 rounded-full font-label-md transition-colors ${filter === 'all' ? 'bg-primary-container text-on-primary' : 'bg-surface-raised text-on-surface-variant hover:bg-surface-raised/80 hover:text-primary'}`}
              onClick={() => setFilter('all')}
            >
              Semua
            </button>
            <button
              className={`px-4 py-2 rounded-full font-label-md transition-colors ${filter === 'project' ? 'bg-primary-container text-on-primary' : 'bg-surface-raised text-on-surface-variant hover:bg-surface-raised/80 hover:text-primary'}`}
              onClick={() => setFilter('project')}
            >
              Project
            </button>
            <button
              className={`px-4 py-2 rounded-full font-label-md transition-colors ${filter === 'certificate' ? 'bg-primary-container text-on-primary' : 'bg-surface-raised text-on-surface-variant hover:bg-surface-raised/80 hover:text-primary'}`}
              onClick={() => setFilter('certificate')}
            >
              Sertifikasi
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <div key={idx} className="glass-panel rounded-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col">
                <div className={`relative h-48 w-full overflow-hidden ${item.type === 'certificate' ? 'bg-surface-deep flex items-center justify-center p-4' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    alt={item.title} 
                    className={`${item.type === 'certificate' ? 'max-h-full object-contain' : 'absolute inset-0 w-full h-full object-cover'} transition-transform group-hover:scale-110`} 
                    src={item.image}
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">{item.title}</h3>
                  <p className="font-body-md text-body-md text-text-secondary mb-4 flex-1">{item.desc}</p>
                  {item.type === 'project' && (
                    <a className="text-primary font-label-md text-label-md inline-flex items-center hover:underline" href={item.link} target="_blank" rel="noreferrer">
                      Lihat Project <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hobbies Section */}
        <section id="hobbies">
          <h2 className="font-display-lg text-display-lg text-text-primary mb-8 text-center">Hobi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-xl text-center hover:border-primary transition-colors cursor-pointer group">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary">headphones</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">Mendengarkan Musik</h3>
              <p className="font-body-md text-body-md text-text-secondary">Suka mendengarkan musik saat ngoding atau bersantai.</p>
            </div>
            <div className="glass-panel p-6 rounded-xl text-center hover:border-primary transition-colors cursor-pointer group">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary">code</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">Ngoding &amp; Eksperimen</h3>
              <p className="font-body-md text-body-md text-text-secondary">Mencoba teknologi baru dan membuat mini project.</p>
            </div>

            <div className="glass-panel p-6 rounded-xl text-center hover:border-primary transition-colors cursor-pointer group">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary">sports_esports</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">Gaming</h3>
              <p className="font-body-md text-body-md text-text-secondary">Bermain game untuk refreshing di waktu senggang.</p>
            </div>
            <div className="glass-panel p-6 rounded-xl text-center hover:border-primary transition-colors cursor-pointer group">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary">movie</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">Menonton Film / Series</h3>
              <p className="font-body-md text-body-md text-text-secondary">Rehat sejenak dengan menonton film atau series.</p>
            </div>
            
            <a href="/mylist/anime" className="glass-panel p-6 rounded-xl text-center hover:border-primary transition-colors cursor-pointer group block">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary">animation</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">Menonton Anime</h3>
              <p className="font-body-md text-body-md text-text-secondary">Mengikuti serial anime favorit dan mencatatnya ke dalam daftar tontonan (Klik untuk melihat daftar).</p>
            </a>
            
            <a href="/mylist/buku" className="glass-panel p-6 rounded-xl text-center hover:border-primary transition-colors cursor-pointer group block">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary">menu_book</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">Membaca Buku</h3>
              <p className="font-body-md text-body-md text-text-secondary">Koleksi literatur dan buku-buku yang telah membuka wawasan saya (Klik untuk melihat daftar).</p>
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
            <a className="hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-200" href="https://github.com/EgiDanuajisantosoo" target="_blank" rel="noreferrer">GitHub</a>
            <a className="hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-200" href="https://www.linkedin.com/in/egi-danuajisantoso" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* Mobile Spotify Toggle Button */}
      <button
        className="fixed bottom-4 right-4 z-40 sm:hidden w-12 h-12 rounded-full bg-gradient-to-tr from-[#14d1ff] to-blue-600 text-white shadow-[0_8px_24px_rgba(20,209,255,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border border-[#14d1ff]/50"
        onClick={() => setIsSpotifyOpen(!isSpotifyOpen)}
        aria-label="Toggle Discord Activity"
      >
        <span className="material-symbols-outlined text-2xl">
          {isSpotifyOpen ? 'close' : 'headphones'}
        </span>
      </button>

      {/* Komponen SpotifyCurrentTrack */}
      <div
        className={`fixed right-0 transition-all duration-500 w-[290px] sm:w-full sm:max-w-xs px-2 z-50 
          bottom-20 sm:bottom-[-130px]
          ${isSpotifyOpen ? 'opacity-100 pointer-events-auto translate-y-0 scale-100' : 'opacity-0 pointer-events-none translate-y-10 scale-95'} 
          sm:opacity-100 sm:pointer-events-auto sm:translate-y-0 sm:scale-100 sm:hover:bottom-4`}
      >
        <SpotifyCurrentTrack />
      </div>


      
      <AIChatBot />
    </>
  );
}
