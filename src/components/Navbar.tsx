"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '#hero', label: 'Beranda' },
  { href: '#about', label: 'Tentang' },
  { href: '#skills', label: 'Keahlian' },
  { href: '#timeline', label: 'Pengalaman' },
  { href: '#projects', label: 'Project' },
  { href: '#hobbies', label: 'Hobi' },
];

export default function Navbar() {
  const [activeLink, setActiveLink] = useState('#hero');
  const [menuOpen, setMenuOpen] = useState(false);

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
  }, []);

  return (
    <nav className="bg-surface-raised/60 backdrop-blur-md fixed top-0 w-full z-50 border-b border-white/10 transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <div className="font-headline-sm text-headline-sm font-bold tracking-tighter text-primary">
          <Link href="#hero">EGI DANUAJISANTOSO</Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-on-surface-variant hover:text-primary focus:outline-none"
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

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center">
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
                    ? "text-primary font-bold border-b-2 border-primary pb-1 hover:bg-primary/10 hover:text-primary transition-all duration-300 ease-in-out"
                    : "text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/10 hover:text-primary transition-all duration-300 ease-in-out"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <button className="bg-primary-container text-on-primary px-4 py-2 rounded font-label-md text-label-md hover:bg-primary transition-colors hidden md:block">
          Rekrut Saya
        </button>
      </div>

      {/* Mobile Links */}
      {menuOpen && (
        <div className="md:hidden bg-surface-raised border-t border-white/10 px-4 py-4 space-y-4">
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
                    ? "block text-primary font-bold hover:text-primary transition-colors"
                    : "block text-on-surface-variant hover:text-primary transition-colors"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <button className="w-full mt-4 bg-primary-container text-on-primary px-4 py-2 rounded font-label-md text-label-md hover:bg-primary transition-colors">
            Rekrut Saya
          </button>
        </div>
      )}
    </nav>
  );
}
