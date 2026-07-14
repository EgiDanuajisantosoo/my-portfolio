'use client';

import React, { useState } from 'react';
import { loginAction } from './actions';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/portfolio';
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');
    try {
      await loginAction(formData);
    } catch (e: any) {
      setError(e.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 sm:p-10 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-5xl text-blue-500 mb-4 block">admin_panel_settings</span>
            <h1 className="text-3xl font-extrabold text-white mb-2">Restricted Area</h1>
            <p className="text-sm text-gray-400">Silakan login untuk memodifikasi konten.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-[20px]">person</span>
                <input 
                  type="text" 
                  name="username" 
                  required
                  placeholder="Masukkan username"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-[20px]">lock</span>
                <input 
                  type="password" 
                  name="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Loading...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <a href="/portfolio" className="text-sm text-gray-500 hover:text-white transition-colors">
               Kembali ke Beranda
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}
