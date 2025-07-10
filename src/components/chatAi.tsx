// app/page.js
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data.choices[0].message.content);

    } catch (error) {
      console.error(error);
      setResponse('Gagal mendapatkan respons dari server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>DeepSeek AI di Next.js</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan sesuatu pada DeepSeek..."
          style={{ width: '100%', minHeight: '100px', padding: '10px', fontSize: '16px' }}
          rows={4}
        />
        <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '10px 15px', fontSize: '16px' }}>
          {loading ? 'Memproses...' : 'Kirim'}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <h2>Respons:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}