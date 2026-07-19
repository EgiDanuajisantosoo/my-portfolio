'use client';

import React, { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function AIChatBot({ lang = 'id', dict }: { lang?: string, dict?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: dict?.greeting || 'Halo! 👋 Saya Asisten AI Egi. Ada yang ingin kamu ketahui tentang Egi, keahliannya, proyeknya, atau lagu favoritnya saat ini? Silakan tanya saya!'
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
    if (messages.length > 1 || (messages.length === 1 && messages[0].role !== 'assistant')) {
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
      content: dict?.greeting || 'Halo! 👋 Saya Asisten AI Egi. Ada yang ingin kamu ketahui tentang Egi, keahliannya, proyeknya, atau lagu favoritnya saat ini? Silakan tanya saya!'
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
        body: JSON.stringify({ messages: chatHistory, lang })
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
              content: dict?.quotaExceeded || 'Maaf, kuota harian Asisten AI Egi telah mencapai batas maksimal hari ini. Silakan coba kembali besok ya! Terima kasih atas pengertiannya! 🙏'
            }
          ]);
          return;
        }
        throw new Error('Gagal terhubung dengan server');
      }

      const replyContent = data?.reply || dict?.systemError || 'Maaf, sepertinya ada kendala sistem. Silakan coba sesaat lagi ya!';
      setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);
    } catch (err: any) {
      console.error('[Chat Error]', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: dict?.connError || 'Maaf, sepertinya koneksi sedang bermasalah. Coba tanyakan kembali beberapa saat lagi ya! 🙏'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionChips = dict?.topics || [
    'Lagu favorit Egi saat ini?',
    'Apa keahlian utamanya?',
    'Apa saja proyek buatan Egi?'
  ];

  // A sleek custom markdown-style parser for premium bullet lists, numbered lists, and bold text
  const renderMessageContent = (content: string, isUser: boolean) => {
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Parse bold markdown **text** to high-contrast highlighted inline tags
    const boldClass = isUser ? 'font-bold text-background underline decoration-background/20' : 'font-bold text-text-primary';
    let parsed = escaped.replace(/\*\*(.*?)\*\*/g, `<strong class="${boldClass}">$1</strong>`);
    
    const lines = parsed.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('-');
      const isNumBullet = /^\d+\.\s/.test(trimmed);
      
      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 pl-1 animate-fadeIn">
            <span className={`mt-1.5 text-xs flex-shrink-0 ${isUser ? 'text-background' : 'text-text-secondary'}`}>•</span>
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
            <span className={`font-bold flex-shrink-0 ${isUser ? 'text-background' : 'text-text-primary'}`}>{number}</span>
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
          background: rgba(255, 255, 255, 0.2);
          border-radius: 0;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
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
            className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary text-on-primary hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border border-primary rounded-full"
            aria-label="Tanya AI Asisten"
          >
            {/* Chat Icon */}
            <span className="material-symbols-outlined text-[24px] relative z-10">chat</span>
          </button>
        )}

        {/* Chat Widget Container */}
        {isOpen && (
          <div className="w-[calc(100vw-32px)] sm:w-[400px] h-[480px] sm:h-[520px] bg-surface-raised border border-outline flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-surface border-b border-outline px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary text-on-primary flex items-center justify-center text-xl border border-primary">
                    <span className="material-symbols-outlined text-on-primary text-[20px]">smart_toy</span>
                  </div>
                  {/* Glowing active indicator */}
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-primary border-2 border-surface-raised">
                    <span className="w-full h-full bg-primary block animate-ping opacity-50"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display text-text-primary text-sm tracking-widest uppercase">Asisten AI Egi</h4>
                    <span className="text-[9px] font-label-md border border-outline text-text-secondary px-1.5 py-0.25 uppercase tracking-widest">PRO</span>
                  </div>
                  <p className="text-[9px] font-label-md text-text-secondary flex items-center gap-1 uppercase tracking-widest mt-1">
                    <span className="w-1.5 h-1.5 bg-primary animate-pulse"></span>
                    Online • Llama 3.3
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Reset Chat Button */}
                <button
                  onClick={handleResetChat}
                  className="text-text-secondary hover:text-primary p-2 bg-surface hover:bg-surface-raised border border-outline transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                  aria-label={dict?.resetTitle || 'Reset Percakapan'}
                  title={dict?.resetTitle || 'Reset Percakapan'}
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-secondary hover:text-primary p-2 bg-surface hover:bg-surface-raised border border-outline transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                  aria-label={dict?.closeTitle || 'Tutup Chat'}
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 chat-scrollbar bg-surface-raised">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-chat-msg`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 bg-surface border border-outline flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-text-primary text-[14px]">smart_toy</span>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[78%] px-4 py-3 text-xs font-body leading-relaxed ${
                        isUser
                          ? 'bg-primary text-on-primary font-medium'
                          : 'bg-surface border border-outline text-text-primary'
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
                  <div className="w-7 h-7 bg-surface border border-outline flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-text-primary text-[14px]">smart_toy</span>
                  </div>
                  <div className="bg-surface border border-outline px-4 py-3.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-text-secondary animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary animate-bounce"></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips & Welcome Card */}
            {messages.length === 1 && !isLoading && (
              <div className="px-5 py-3.5 flex flex-col gap-2.5 bg-surface border-t border-outline">
                <p className="text-[9px] font-label-md text-text-secondary uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-1 bg-text-secondary animate-pulse"></span>
                  {dict?.recTopics || 'Rekomendasi Topik Obrolan:'}
                </p>
                <div className="flex flex-col gap-2">
                  {suggestionChips.map((chip: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="text-xs font-body bg-surface-raised hover:bg-primary hover:text-on-primary text-text-primary border border-outline px-3.5 py-2.5 text-left transition-all duration-300 cursor-pointer"
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
              className="p-4 bg-surface border-t border-outline flex gap-3.5 items-center"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={dict?.inputPlaceholder || "Tanya tentang hobi, skill, proyek, dll..."}
                  disabled={isLoading}
                  className="w-full bg-surface-raised border border-outline text-text-primary font-body placeholder-text-secondary px-4 py-2.5 text-xs focus:outline-none focus:border-primary transition-all duration-300 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:scale-100 cursor-pointer"
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
