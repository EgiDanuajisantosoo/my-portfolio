'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Memproses otorisasi...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setMessage(`Error: ${error}`);
      return;
    }

    if (code) {
      setMessage("Otorisasi berhasil! Kode Anda telah diterima. Anda bisa menukar kode ini dengan Access Token.");

      fetch('/api/spotify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.text();
            setMessage(`Gagal menukar kode: ${err}`);
            return;
          }
          const data = await res.json();

          const fiveYearsMs = 5 * 365 * 24 * 60 * 60 * 1000;
          const expiresAt = Date.now() + fiveYearsMs;
          if (data?.access_token) {
            localStorage.setItem(
              'spotifyAuth',
              JSON.stringify({
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                tokenType: data.token_type,
                scope: data.scope,
                expiresAt, // 5 tahun dari sekarang
              })
            );
          }

          setMessage("Token berhasil didapatkan! Mengarahkan ke profil...");
          console.log("Spotify Token Response:", data);
          // window.location.href = "/profile";
        })
        .catch((err) => {
          setMessage(`Terjadi kesalahan: ${err.message}`);
        });

      console.log("Spotify Authorization Code:", code);
    } else {
      setMessage("Tidak menemukan kode otorisasi. Silakan coba lagi.");
    }
  }, [searchParams]);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Status Otorisasi Spotify</h1>
      <p>{message}</p>
    </div>
  );
}
