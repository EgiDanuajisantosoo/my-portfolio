import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Format pesan tidak valid' }, { status: 400 });
    }

    // 1. Fetch Real-time Contexts
    let nowPlayingText = 'Egi sedang tidak aktif mendengarkan musik di Spotify saat ini.';
    let topTracksText = '- Goodbye oleh Air Supply\n- It\'s You oleh Ali Gatie\n- i\'ve always loved you oleh Arash Buana';
    let topArtistsText = '- Gracie Abrams\n- Niki\n- For Revenge';

    try {
      const [lanyardRes, tracksRes, artistsRes] = await Promise.allSettled([
        fetch('https://api.lanyard.rest/v1/users/688864050989367357', { cache: 'no-store' }),
        fetch(`http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=Egiii012&api_key=9cb0b4149461b1448b00668cf94e5a59&period=overall&limit=5&format=json`, { next: { revalidate: 3600 } }),
        fetch(`http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=Egiii012&api_key=9cb0b4149461b1448b00668cf94e5a59&period=overall&limit=5&format=json`, { next: { revalidate: 3600 } })
      ]);

      if (lanyardRes.status === 'fulfilled' && lanyardRes.value.ok) {
        const json = await lanyardRes.value.json();
        const data = json.data;
        if (data?.listening_to_spotify && data?.spotify) {
          nowPlayingText = `🟢 SEDANG DIPUTAR SEKARANG: "${data.spotify.song}" oleh ${data.spotify.artist} di Spotify!`;
        }
      }

      if (tracksRes.status === 'fulfilled' && tracksRes.value.ok) {
        const json = await tracksRes.value.json();
        const tracks = json.toptracks?.track || [];
        if (tracks.length > 0) {
          topTracksText = tracks.map((t: any) => `- ${t.name} oleh ${t.artist?.name} (${t.playcount} scrobbles)`).join('\n');
        }
      }

      if (artistsRes.status === 'fulfilled' && artistsRes.value.ok) {
        const json = await artistsRes.value.json();
        const artists = json.topartists?.artist || [];
        if (artists.length > 0) {
          topArtistsText = artists.map((a: any) => `- ${a.name} (${a.playcount} scrobbles)`).join('\n');
        }
      }
    } catch (e) {
      console.error('[Chat Context Error]', e);
    }

    // 2. Build Groq Personal Assistant Prompt
    const systemPrompt = `Kamu adalah Asisten AI Pribadi Egi Danuajisantoso. Tugasmu adalah menjawab pertanyaan pengunjung portofolio tentang Egi dengan ramah, profesional, ringkas, dan menyenangkan menggunakan Bahasa Indonesia yang asyik tapi sopan.

Berikut adalah informasi lengkap tentang Egi yang harus kamu gunakan sebagai konteks utama:
- Nama Lengkap: Egi Danuajisantoso
- Peran/Profesi: Web Developer yang bersemangat, khususnya berfokus pada Laravel (PHP), MySQL, Tailwind CSS, JavaScript, dan Next.js.
- Motto Hidup: "Hidup itu pilihan, jadi setiap keputusan yang Anda pilih akan menentukan kehidupan Anda dan setiap pilihan terkadang harus ada suatu hal yang dikorbankan..."
- Pendidikan:
  * D3 Rekayasa Perangkat Lunak Aplikasi di Telkom University (2023 - Sekarang)
  * SMK Telekomunikasi Tunas Harapan (2020 - 2023), jurusan Rekayasa Perangkat Lunak.
- Pengalaman Kerja/Magang: Magang selama 3 bulan di PT. Adhikari Inovasi Indonesia saat SMK.
- Proyek Terbesar:
  * Website KontrakanKita (Laravel 12, MySQL, Google Client API, Pusher, Tailwind) - Aplikasi manajemen kontrakan modern. Tautan github: https://github.com/EgiDanuajisantosoo/KontrakanKita
  * Website UsahaKita (Laravel 11, MySQL, Filament, Tailwind) - Aplikasi manajemen UMKM. Tautan github: https://github.com/EgiDanuajisantosoo/pbw2_Tubes_UsahaKita
  * Website Rental Mobil (Tailwind, JS, HTML, CSS, Aos.js) - Landing page/sistem rental mobil. Tautan github: https://github.com/EgiDanuajisantosoo/RentCar
- Sertifikasi Profesional (BNSP):
  * Sertifikat Junior Web Developer (Badan Nasional Sertifikasi Profesi)
  * Sertifikat Office Application (Badan Nasional Sertifikasi Profesi)
- Hobi: Mendengarkan Musik, Ngoding & Eksperimen, Belajar & Membaca, Gaming, Menonton Film & Anime/Series.

--- DATA REAL-TIME AKTIVITAS MUSIK EGI ---
[NOW PLAYING DI SPOTIFY SAAT INI]
${nowPlayingText}

[TOP FAVORITE TRACKS / LAGU TERATAS EGI]
${topTracksText}

[TOP FAVORITE ARTISTS / ARTIS TERATAS EGI]
${topArtistsText}

--- PETUNJUK UTAMA ---
1. Jika ada yang bertanya tentang lagu favorit atau apa yang sedang didengarkan Egi, sebutkan lagu teratas atau status putar dari data real-time di atas!
2. Jika ditanya tentang kepribadian, hobi, atau latar belakang Egi, berikan jawaban berdasarkan data riwayat dan hobi di atas secara menarik (misalnya, hubungkan hobi mendengarkan musik dengan produktivitasnya saat ngoding Laravel!).
3. Jawablah secara singkat (maksimal 2-3 paragraf per respons) agar nyaman dibaca di chat widget. Gunakan emoji yang ramah (seperti 🎵, 💻, 🚀, dll.).
4. Jangan mengada-ada informasi di luar konteks yang diberikan. Jika kamu tidak tahu, katakan dengan sopan bahwa kamu adalah asisten Egi dan menyarankan mereka untuk langsung menghubungi Egi melalui kontak sosial media yang tertera (LinkedIn, Instagram, Discord, atau Spotify) di bagian "Tentang Saya" atau footer website.`;

    // 3. Request Groq API using fetch
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'llama-3.3-70b-versatile';
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1';

    if (!apiKey) {
      return NextResponse.json({ error: 'Kunci API Groq belum dikonfigurasi' }, { status: 500 });
    }

    const payload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 800
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
