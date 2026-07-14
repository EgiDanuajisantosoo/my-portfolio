'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read the current lang from cookies if possible, 
    // but in client side we just read document.cookie
    const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
    if (match) {
      setLang(match[2] as 'id' | 'en');
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'id' ? 'en' : 'id';
    setLang(newLang);
    
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    
    // Refresh to trigger server components re-render with new cookie
    router.refresh();
  };

  if (!mounted) return <div className="w-14 h-8 bg-white/5 rounded-full animate-pulse"></div>;

  return (
    <button 
      onClick={toggleLanguage}
      className="relative flex items-center w-14 h-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-label="Toggle Language"
    >
      <div 
        className={`absolute top-1 left-1 w-6 h-6 bg-primary rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out ${lang === 'en' ? 'transform translate-x-6 bg-secondary' : ''}`}
      >
        <span className="text-[10px] font-bold text-on-primary uppercase">
          {lang}
        </span>
      </div>
      <div className="w-full flex justify-between px-1.5 text-[9px] font-bold text-text-secondary">
        <span>ID</span>
        <span>EN</span>
      </div>
    </button>
  );
}
