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

  if (!mounted) return <div className="w-16 h-8 border border-outline rounded-full opacity-50"></div>;

  return (
    <button 
      onClick={toggleLanguage}
      className="relative flex items-center w-16 h-8 bg-transparent border border-primary rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none flex-shrink-0"
      aria-label="Toggle Language"
    >
      <div 
        className={`absolute top-1 left-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center transition-transform duration-300 ease-in-out ${lang === 'en' ? 'transform translate-x-8' : ''}`}
      >
        <span className="text-[10px] font-bold text-on-primary font-label-md uppercase">
          {lang}
        </span>
      </div>
      <div className="w-full flex justify-between px-2 text-[9px] font-bold text-text-secondary font-label-md">
        <span>ID</span>
        <span>EN</span>
      </div>
    </button>
  );
}
