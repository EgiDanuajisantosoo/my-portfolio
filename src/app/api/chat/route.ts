import { NextResponse, NextRequest } from 'next/server';
import personalityData from './personality.json';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { messages, lang = 'id' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Format pesan tidak valid' }, { status: 400 });
    }

    // Detect user intent based on the latest user message
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const isAskingAboutMusic = /lagu|musik|spotify|dengar|artis|singer|song|playing|favorite|putar|nyanyi|denger/i.test(lastUserMessage);
    const isAskingAboutBio = /siapa|tentang|kepribadian|hobi|kuliah|kerja|proyek|project|keahlian|skill|laravel|sekolah|smk|belajar|karakter|gaya|pressure|tekanan|lemah|kuat|kekuatan|tantangan|pendidikan|tech|stack|arsitektur|buat|cipta|bikin/i.test(lastUserMessage);

    // 1. Fetch Real-time Contexts Conditionally
    let nowPlayingText = 'Egi sedang tidak aktif mendengarkan musik di Spotify saat ini.';
    let topTracksText = '';
    let topArtistsText = '';

    try {
      const fetches: Promise<any>[] = [];
      // Always fetch Lanyard because it is extremely fast and tells live status
      fetches.push(fetch('https://api.lanyard.rest/v1/users/688864050989367357', { cache: 'no-store' }));

      if (isAskingAboutMusic) {
        fetches.push(fetch(`http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=Egiii012&api_key=9cb0b4149461b1448b00668cf94e5a59&period=overall&limit=5&format=json`, { next: { revalidate: 3600 } }));
        fetches.push(fetch(`http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=Egiii012&api_key=9cb0b4149461b1448b00668cf94e5a59&period=overall&limit=5&format=json`, { next: { revalidate: 3600 } }));
      }

      const results = await Promise.allSettled(fetches);

      if (results[0].status === 'fulfilled' && results[0].value.ok) {
        const json = await results[0].value.json();
        const data = json.data;
        if (data?.listening_to_spotify && data?.spotify) {
          nowPlayingText = `🟢 SEDANG DIPUTAR SEKARANG: "${data.spotify.song}" oleh ${data.spotify.artist} di Spotify!`;
        }
      }

      if (isAskingAboutMusic) {
        const tracksRes = results[1];
        const artistsRes = results[2];

        if (tracksRes && tracksRes.status === 'fulfilled' && tracksRes.value.ok) {
          const json = await tracksRes.value.json();
          const tracks = json.toptracks?.track || [];
          if (tracks.length > 0) {
            topTracksText = tracks.map((t: any) => `- ${t.name} oleh ${t.artist?.name} (${t.playcount} scrobbles)`).join('\n');
          }
        }

        if (artistsRes && artistsRes.status === 'fulfilled' && artistsRes.value.ok) {
          const json = await artistsRes.value.json();
          const artists = json.topartists?.artist || [];
          if (artists.length > 0) {
            topArtistsText = artists.map((a: any) => `- ${a.name} (${a.playcount} scrobbles)`).join('\n');
          }
        }
      }
    } catch (e) {
      console.error('[Chat Context Error]', e);
    }

    // Format personality data dynamically: Load full compressed text only if asked
    const p = personalityData;
    const personalityText = isAskingAboutBio ? `
Identitas: ${p.identitas.nama_lengkap} (${p.identitas.nama_panggilan}), ${p.identitas.latar_belakang_pendidikan}. Fokus: ${p.identitas.profil_developer.fokus.join(',')}. Arah Karier: ${p.identitas.arah_karier.join(',')}.
Karakter: ${p.kepribadian_dan_gaya_berpikir.karakter_utama.join(',')}. Suka: ${p.kepribadian_dan_gaya_berpikir.pola_berpikir.hal_yang_disukai.join('; ')}.
Problem Solving: ${p.kepribadian_dan_gaya_berpikir.pola_berpikir.pendekatan_problem_solving.join('; ')}.
Tech Stack: ${p.ketertarikan_teknikal.bahasa_pemrograman.join(',')}. Framework: ${p.ketertarikan_teknikal.framework_dan_teknologi.join(',')}.
Konsep: ${p.ketertarikan_teknikal.konsep_yang_dipahami.join(',')}.
Gaya Kerja: ${p.filosofi_pengembangan.gaya_pengembangan_yang_disukai.join(',')}. Cara berpikir produk: ${p.filosofi_pengembangan.cara_berpikir_produk.mempertimbangkan.join(',')}.
Proyek: ${p.proyek.map((proj: any) => `*${proj.nama}(${proj.jenis}; Tech:${proj.tech_stack?.join(',') || ''}; Konsep:${proj.konsep?.join(',') || ''}; Insight:${proj.insight?.join(',') || ''})`).join(' ')}
Kekuatan: ${p.kekuatan_engineering.kekuatan.join(',')}.
Limitasi: ${p.area_pengembangan.area.map((a: any) => `${a.nama}(${a.detail})`).join('; ')}.
Belajar: ${p.pola_belajar.metode_belajar_terbaik.join(',')}. Gaya: ${p.pola_belajar.gaya_belajar}.
Ringkasan: ${p.ringkasan.deskripsi}
    `.trim() : `Egi Danuajisantoso adalah Web Developer (Laravel, PHP, Next.js, MySQL). Dia lulusan D3 Rekayasa Perangkat Lunak Telkom University. Pola pikir builder-oriented, fokus arsitektur backend, otomasi workflow, AI-assisted engineering.`;

    // Dynamic music context section to save tokens if user doesn't ask about music
    const musicSection = isAskingAboutMusic ? `
--- DATA REAL-TIME AKTIVITAS MUSIK EGI ---
[NOW PLAYING DI SPOTIFY SAAT INI]
${nowPlayingText}

[TOP FAVORITE TRACKS / LAGU TERATAS EGI]
${topTracksText}

[TOP FAVORITE ARTISTS / ARTIS TERATAS EGI]
${topArtistsText}
    `.trim() : `
--- STATUS LIVE SPOTIFY ---
${nowPlayingText}
    `.trim();

    // 2. Build Groq Personal Assistant Prompt
    const isEnglish = lang === 'en';
    const langInstruction = isEnglish 
      ? 'You MUST answer entirely in English. Your tone should be friendly, professional, and slightly casual but polite.' 
      : 'Jawablah menggunakan Bahasa Indonesia yang asyik tapi sopan.';

    const systemPrompt = `Kamu adalah Asisten AI Pribadi Egi Danuajisantoso. Tugasmu adalah menjawab pertanyaan pengunjung portofolio tentang Egi dengan ramah, profesional, ringkas, dan menyenangkan. ${langInstruction}

Berikut adalah informasi lengkap tentang Egi yang harus kamu gunakan sebagai konteks utama:
- Nama Lengkap: Egi Danuajisantoso
- Peran/Profesi: Web Developer yang bersemangat, khususnya berfokus pada Laravel (PHP), MySQL, Tailwind CSS, JavaScript, dan Next.js.
- Motto Hidup: "Hidup itu pilihan, jadi setiap keputusan yang Anda pilih akan menentukan kehidupan Anda dan setiap pilihan terkadang harus ada suatu hal yang dikorbankan..."
- Pendidikan:
  * D3 Rekayasa Perangkat Lunak Aplikasi di Telkom University (2023 - Sekarang)
  * SMK Telekomunikasi Tunas Harapan (2020 - 2023), jurusan Rekayasa Perangkat Lunak.
- Pengalaman Kerja/Magang: Magang selama 3 bulan di PT. Adhikari Inovasi Indonesia saat SMK.

--- DETAIL KEPRIBADIAN, FILOSOFI, PROYEK & KARAKTER ENGINEERING EGI (PERSONALITY CONTEXT) ---
${personalityText}

${musicSection}

--- PETUNJUK UTAMA PERILAKU & GAYA RESPON AI (PENTING!) ---
1. GAYA KOMUNIKASI: Jawablah dengan berbasis REASONING, TEKNIKAL, TERSTRUKTUR, MEMAHAMI TRADEOFF, dan LANGSUNG KE INTI. Hindari memberikan motivasi kosong atau penjelasan yang terlalu umum/sederhana.
2. JELASKAN ARSITEKTUR: Jika ditanya mengenai proyek Egi, jelaskan bagaimana arsitektur proyek tersebut, identify constraints, jelaskan MVP, dan berikan technical reasoning yang jelas berdasarkan data di atas.
3. LAGU FAVORIT: Jika ada yang bertanya tentang lagu favorit atau apa yang sedang didengarkan Egi, sebutkan lagu teratas atau status putar dari data real-time di atas!
5. Jangan mengada-ada informasi di luar konteks yang diberikan. Jika kamu tidak tahu, katakan dengan sopan bahwa kamu adalah asisten Egi dan menyarankan mereka untuk langsung menghubungi Egi melalui kontak sosial media yang tertera (LinkedIn, Instagram, Discord, atau Spotify) di bagian "Tentang Saya" atau footer website.`;

    // 3. Request Groq API using fetch
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'llama-3.3-70b-versatile';
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1';

    if (!apiKey) {
      return NextResponse.json({ error: 'Kunci API Groq belum dikonfigurasi' }, { status: 500 });
    }

    // Limit chat history to the last 6 messages (3 turns of conversation) to save massive tokens
    const limitedMessages = messages.slice(-6);

    const payload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...limitedMessages
      ],
      temperature: 0.7,
      max_tokens: 400
    };

    const groqRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      const isQuotaExceeded = groqRes.status === 429 || 
        /quota|rate_limit|limit_exceeded|insufficient_balance|token_limit/i.test(errText);

      if (isQuotaExceeded) {
        return NextResponse.json({
          quotaExceeded: true,
          reply: 'Maaf, kuota harian Asisten AI Egi telah mencapai batas maksimal hari ini. Silakan coba kembali besok ya! Terima kasih atas pengertiannya! 🙏'
        });
      }

      return NextResponse.json({ error: 'Gagal mendapatkan respon dari AI', details: errText }, { status: groqRes.status });
    }

    const groqData = await groqRes.json();
    const reply = groqData.choices?.[0]?.message?.content || '';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('[API Chat Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
