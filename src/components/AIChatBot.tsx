'use client';

import React, { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Halo! 👋 Saya Asisten AI Egi. Ada yang ingin kamu ketahui tentang Egi, keahliannya, proyeknya, atau lagu favoritnya saat ini? Silakan tanya saya!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat state from localStorage on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('egichat_messages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      const savedIsOpen = localStorage.getItem('egichat_is_open');
      if (savedIsOpen) {
        setIsOpen(savedIsOpen === 'true');
      }
    } catch (e) {
      console.error('[Load Chat State Error]', e);
    }
  }, []);

  // Save messages to localStorage when changed
  useEffect(() => {
    if (messages.length > 1 || (messages.length === 1 && messages[0].content !== 'Halo! 👋 Saya Asisten AI Egi. Ada yang ingin kamu ketahui tentang Egi, keahliannya, proyeknya, atau lagu favoritnya saat ini? Silakan tanya saya!')) {
      try {
        localStorage.setItem('egichat_messages', JSON.stringify(messages));
      } catch (e) {
        console.error('[Save Messages Error]', e);
      }
    }
  }, [messages]);

  // Save isOpen to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('egichat_is_open', String(isOpen));
    } catch (e) {
      console.error('[Save isOpen Error]', e);
    }
  }, [isOpen]);

  const handleResetChat = () => {
    const defaultGreeting: Message = {
      role: 'assistant',
      content: 'Halo! 👋 Saya Asisten AI Egi. Ada yang ingin kamu ketahui tentang Egi, keahliannya, proyeknya, atau lagu favoritnya saat ini? Silakan tanya saya!'
    };
    setMessages([defaultGreeting]);
    try {
      localStorage.removeItem('egichat_messages');
    } catch (e) {
      console.error('[Clear Chat Error]', e);
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // Abaikan jika bukan JSON
      }

      if (!res.ok) {
        if (res.status === 429 || data?.quotaExceeded) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'Maaf, kuota harian Asisten AI Egi telah mencapai batas maksimal hari ini. Silakan coba kembali besok ya! Terima kasih atas pengertiannya! 🙏'
            }
          ]);
          return;
        }
        throw new Error('Gagal terhubung dengan server');
      }

      const replyContent = data?.reply || 'Maaf, sepertinya ada kendala sistem. Silakan coba sesaat lagi ya!';
      setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);
    } catch (err: any) {
      console.error('[Chat Error]', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Maaf, sepertinya koneksi sedang bermasalah. Coba tanyakan kembali beberapa saat lagi ya! 🙏'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionChips = [
    '🎵 Lagu favorit Egi saat ini?',
    '⚡ Apa keahlian utamanya?',
    '💼 Apa saja proyek buatan Egi?'
  ];

  // A sleek custom markdown-style parser for premium bullet lists, numbered lists, and bold text
  const renderMessageContent = (content: string, isUser: boolean) => {
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Parse bold markdown **text** to high-contrast highlighted inline tags
    const boldClass = isUser ? 'font-bold text-white underline decoration-white/20' : 'font-semibold text-primary';
    let parsed = escaped.replace(/\*\*(.*?)\*\*/g, `<strong class="${boldClass}">$1</strong>`);
    
    const lines = parsed.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('-');
      const isNumBullet = /^\d+\.\s/.test(trimmed);
      
      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 pl-1 animate-fadeIn">
            <span className={`mt-1.5 text-xs flex-shrink-0 ${isUser ? 'text-white' : 'text-primary'}`}>•</span>
            <span dangerouslySetInnerHTML={{ __html: trimmed.substring(1).trim() }} className="text-inherit leading-relaxed" />
          </div>
        );
      }
      
      if (isNumBullet) {
        const dotIndex = trimmed.indexOf('.');
        const number = trimmed.substring(0, dotIndex + 1);
        const text = trimmed.substring(dotIndex + 1).trim();
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 pl-1 animate-fadeIn">
            <span className={`font-bold flex-shrink-0 ${isUser ? 'text-white' : 'text-primary'}`}>{number}</span>
            <span dangerouslySetInnerHTML={{ __html: text }} className="text-inherit leading-relaxed" />
          </div>
        );
      }
      
      return (
        <p 
          key={idx} 
          className={`${trimmed === '' ? 'h-2' : 'my-1'} leading-relaxed`}
          dangerouslySetInnerHTML={{ __html: line }}
        />
      );
    });
  };

  return (
    <>
      {/* Scrollbar Customization Styles injected globally */}
      <style dangerouslySetInnerHTML={{ __html: `
        .chat-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(76, 244, 121, 0.3);
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-chat-msg {
          animation: chatFadeIn 0.25s ease-out forwards;
        }
      `}} />

      {/* Floating Chat Button */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#1ed760] via-emerald-500 to-[#1ed760] text-white shadow-[0_8px_24px_rgba(30,215,96,0.3)] hover:shadow-[0_12px_32px_rgba(30,215,96,0.45)] hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
            aria-label="Tanya AI Asisten"
          >
            {/* Ambient Pulse Glowing Ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#1ed760] to-emerald-400 opacity-40 animate-ping group-hover:opacity-60 transition-opacity"></span>
            
            {/* Chat Icon */}
            <span className="material-symbols-outlined text-[28px] relative z-10 transform group-hover:rotate-12 transition-transform duration-300">forum</span>
          </button>
        )}

        {/* Chat Widget Container */}
        {isOpen && (
          <div className="w-[calc(100vw-32px)] sm:w-[400px] h-[480px] sm:h-[520px] bg-background/85 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-gradient-to-r from-surface-raised/90 to-surface-container-lowest/90 border-b border-white/5 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1ed760]/20 to-emerald-500/20 border border-[#1ed760]/30 flex items-center justify-center text-xl shadow-inner">
                    <span className="material-symbols-outlined text-[#1ed760] text-[24px]">support_agent</span>
                  </div>
                  {/* Glowing active indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#1ed760] rounded-full border-2 border-background flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white text-sm tracking-wide">Asisten AI Egi</h4>
                    <span className="text-[9px] bg-gradient-to-r from-[#1ed760]/10 to-emerald-500/10 border border-[#1ed760]/30 text-[#1ed760] font-bold px-1.5 py-0.25 rounded-md uppercase tracking-widest scale-90">PRO</span>
                  </div>
                  <p className="text-[10px] text-[#1ed760]/80 font-semibold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#1ed760]/80 animate-pulse"></span>
                    Online • Llama 3.3
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Reset Chat Button */}
                <button
                  onClick={handleResetChat}
                  className="text-neutral-400 hover:text-[#1ed760] p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                  aria-label="Reset Percakapan"
                  title="Reset Percakapan"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                  aria-label="Tutup Chat"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 chat-scrollbar bg-surface-container-lowest/30">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-chat-msg`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1ed760]/10 to-emerald-500/10 border border-[#1ed760]/20 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <span className="material-symbols-outlined text-[#1ed760] text-[16px]">support_agent</span>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-[0_4px_12px_rgba(0,0,0,0.08)] ${
                        isUser
                          ? 'bg-gradient-to-tr from-[#1ed760] via-emerald-500 to-[#1ed760] text-white rounded-tr-none font-medium'
                          : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-sm'
                      }`}
                    >
                      {renderMessageContent(msg.content, isUser)}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start animate-chat-msg">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1ed760]/10 to-emerald-500/10 border border-[#1ed760]/20 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                    <span className="material-symbols-outlined text-[#1ed760] text-[16px]">support_agent</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 bg-[#1ed760] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#1ed760]/70 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips & Welcome Card */}
            {messages.length === 1 && !isLoading && (
              <div className="px-5 py-3.5 flex flex-col gap-2.5 bg-surface-container-lowest/50 border-t border-white/5">
                <p className="text-[9px] text-[#1ed760] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#1ed760] animate-pulse"></span>
                  Rekomendasi Topik Obrolan:
                </p>
                <div className="flex flex-col gap-2">
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.substring(2))} // Strip emoji from trigger content
                      className="text-xs bg-white/5 hover:bg-[#1ed760]/10 hover:text-white text-slate-300 border border-white/5 hover:border-[#1ed760]/30 px-3.5 py-2.5 rounded-xl text-left transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_2px_10px_rgba(30,215,96,0.1)] hover:translate-x-1"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-4 bg-surface-container-lowest/90 border-t border-white/5 flex gap-3.5 items-center shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tanya tentang hobi, skill, proyek, dll..."
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-full px-5 py-3 text-xs focus:outline-none focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760]/30 transition-all duration-300 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1ed760] via-emerald-500 to-[#1ed760] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(30,215,96,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:scale-100 cursor-pointer"
                aria-label="Kirim"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
