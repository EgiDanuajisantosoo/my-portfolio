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
    'Lagu favorit Egi saat ini?',
    'Apa keahlian utamanya?',
    'Apa saja proyek buatan Egi?'
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 left-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#1ed760] to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer"
            aria-label="Tanya AI Asisten"
          >
            {/* Ambient Pulse Glowing Ring */}
            <span className="absolute -inset-1 rounded-full bg-[#1ed760]/40 animate-ping opacity-75 group-hover:opacity-100 transition-opacity"></span>
            
            {/* Chat Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7 relative z-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
        )}

        {/* Chat Widget Container */}
        {isOpen && (
          <div className="w-80 sm:w-96 h-[480px] bg-[#162139]/95 backdrop-blur-md border border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a2b50] to-[#162139] border-b border-neutral-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#1ed760]/20 flex items-center justify-center text-lg">
                    🤖
                  </div>
                  {/* Glowing active indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#162139] animate-pulse"></span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Asisten AI Egi</h4>
                  <p className="text-[10px] text-emerald-400 font-medium">Online • Groq Llama 3.3</p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Tutup Chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#1ed760] to-emerald-600 text-white rounded-br-none'
                        : 'bg-[#1a2b50] text-neutral-200 rounded-bl-none border border-neutral-700/50'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1a2b50] border border-neutral-700/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-2 flex flex-col gap-1.5 border-t border-neutral-800/40">
                <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Saran Pertanyaan:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="text-xs bg-[#1a2b50]/60 hover:bg-[#1ed760]/20 hover:text-[#1ed760] text-neutral-300 border border-neutral-700/60 hover:border-[#1ed760]/40 px-2.5 py-1 rounded-full text-left transition-all duration-200 cursor-pointer"
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
              className="p-3 bg-[#101828]/90 border-t border-neutral-800 flex gap-2 items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tanya tentang Egi..."
                disabled={isLoading}
                className="flex-1 bg-neutral-900 border border-neutral-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#1ed760] transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-[#1ed760] to-emerald-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform disabled:opacity-40 disabled:scale-100 cursor-pointer"
                aria-label="Kirim"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 transform rotate-45 -translate-x-0.5 translate-y-0.5"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
