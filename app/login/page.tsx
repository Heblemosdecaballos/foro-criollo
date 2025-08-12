'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/` },
    });

    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold">Ingresar</h1>

      {msg && <p className="mb-3 text-red-600">{msg}</p>}
      {sent ? (
        <p>Revisa tu bandeja y haz clic en el enlace que te enviamos.</p>
      ) : (
        <form onSubmit={send} className="space-y-3">
          <input
            type="email"
            className="w-full rounded border px-3 py-2"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Enviando…' : 'Enviar enlace mágico'}
          </button>
        </form>
      )}
    </div>
  );
}
