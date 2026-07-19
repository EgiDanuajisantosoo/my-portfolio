"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar({ dict }: { dict?: any }) {
  const [activeLink, setActiveLink] = useState('#hero');
  const [menuOpen, setMenuOpen] = useState(false);

  // Fallback if dict is not provided
  const d = dict || {
    beranda: 'Beranda',
    tentang: 'Tentang',
    keahlian: 'Keahlian',
    pengalaman: 'Pengalaman',
    projects: 'Project',
    hobbies: 'Hobi',
    rekrut: 'Rekrut Saya'
  };

  const navLinks = [
    { href: '#hero', label: d.beranda },
    { href: '#about', label: d.tentang },
    { href: '#skills', label: d.keahlian },
    { href: '#timeline', label: d.pengalaman },
    { href: '#projects', label: d.projects },
    { href: '#hobbies', label: d.hobbies },
  ];

  useEffect(() => {
    const handleScroll = () => {
      let current = '#hero';
      for (const link of navLinks) {
        const section = document.querySelector(link.href);
        if (section) {
          const rect = (section as HTMLElement).getBoundingClientRect();
          if (rect.top <= 150) {
            current = link.href;
          }
        }
      }
      
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      if (isAtBottom) {
        current = navLinks[navLinks.length - 1].href;
      }
      
      setActiveLink(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  return (
    <nav className="bg-background fixed top-0 w-full z-50 border-b border-outline transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center gap-8 px-4 md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <div className="font-display text-text-primary text-[12px] lg:text-[14px] tracking-[2px] lg:tracking-[4px] uppercase font-bold flex-shrink-0 z-10">
          <Link href="#hero" className="hover:text-secondary hover:scale-105 inline-block transition-all duration-300">EGI DANUAJISANTOSO</Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            className="text-text-primary hover:text-text-secondary focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
          <LanguageSwitcher />
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex gap-4 lg:gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = link.href === activeLink;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveLink(link.href);
                  const el = document.querySelector(link.href);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={
                  isActive
                    ? "text-primary font-bold border-b border-primary pb-1 font-label-md uppercase tracking-widest text-[12px] transition-all duration-300 ease-in-out"
                    : "text-text-secondary hover:text-secondary hover:scale-110 inline-block font-label-md uppercase tracking-[1px] lg:tracking-[2px] text-[12px] lg:text-[14px] transition-all duration-300"
                }
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="flex items-center pl-6 border-l border-outline gap-6">
            <button className="whitespace-nowrap bg-transparent text-primary border border-primary px-8 py-2 rounded-full font-label-md uppercase tracking-[2.5px] text-[14px] hover:bg-secondary hover:text-on-secondary hover:border-secondary hover:scale-105 transition-all duration-300">
              {d.rekrut}
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Mobile Links */}
      {menuOpen && (
        <div className="lg:hidden bg-surface-container border-t border-outline px-4 py-6 space-y-6 shadow-none">
          {navLinks.map((link) => {
            const isActive = link.href === activeLink;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveLink(link.href);
                  setMenuOpen(false);
                  const el = document.querySelector(link.href);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={
                  isActive
                    ? "block text-primary font-bold font-label-md uppercase tracking-[2px] text-[14px]"
                    : "block text-text-secondary hover:text-secondary hover:scale-110 inline-block font-label-md uppercase tracking-[2px] text-[14px] transition-all duration-300"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-outline">
            <button className="w-full bg-transparent text-primary border border-primary px-4 py-3 rounded-full font-label-md uppercase tracking-[2.5px] text-[14px] hover:bg-secondary hover:text-on-secondary hover:border-secondary hover:scale-105 transition-all duration-300">
              {d.rekrut}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
