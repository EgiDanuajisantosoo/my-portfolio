// app/api/chat/route.ts
import { NextResponse } from 'next/server';

// Interface bisa tetap sama karena struktur respons OpenRouter mirip
interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
  }[];
}

interface OpenRouterError {
  error?: {
    message?: string;
  };
}

export async function POST(request: Request) {
  // Ganti nama variabel agar lebih jelas
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  // Debugging untuk memastikan kunci API terbaca
  console.log('OpenRouter API Key Used:', OPENROUTER_API_KEY ? 'Loaded' : 'NOT LOADED');

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'Kunci API OpenRouter tidak diatur di .env.local' }, { status: 500 });
  }

  try {
    const { message }: { message: string } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', { // 1. UBAH URL ENDPOINT
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        // 2. TAMBAHKAN HEADER KUSTOM (SANGAT DIREKOMENDASIKAN)
        'HTTP-Referer': 'http://localhost:3000', // Ganti dengan URL situs Anda nanti
        'X-Title': 'My AI Chat App',           // Ganti dengan nama proyek Anda
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat', // 3. UBAH NAMA MODEL
        messages: [
          {
            role: 'user',
            content: message,
          }
        ],
      }),
    });

    const data: OpenRouterResponse | OpenRouterError = await response.json();

    if (!response.ok) {
      // Ambil pesan error dari respons OpenRouter
      const errorMessage = (data as OpenRouterError).error?.message || `Error dari OpenRouter: ${response.statusText}`;
      console.error('Error Response from OpenRouter:', data);
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    return NextResponse.json(data as OpenRouterResponse);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan internal';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}