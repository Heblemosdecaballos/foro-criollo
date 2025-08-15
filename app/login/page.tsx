'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null);
    const clean = email.trim();
    if (!clean) { setErr('Escribe un email.'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: clean });
      if (error) throw error;
      setMsg('Te enviamos un enlace de acceso a tu correo.');
    } catch (e: any) {
      setErr(e?.message || 'No se pudo enviar el enlace.');
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setErr(null); setMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/threads` }
      });
      if (error) throw error;
    } catch (e: any) {
      setBusy(false);
      setErr(e?.message || 'No se pudo iniciar sesión con Google.');
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-cinzel">Iniciar sesión</h1>

      <form onSubmit={signInWithEmail} className="space-y-3">
        <input
          type="email"
          placeholder="tu@email.com"
          className="w-full p-3 rounded-xl border outline-none"
          style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)' }}
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full p-3 rounded-xl"
          style={{ background:'var(--brand-primary)', color:'#fff', opacity: busy ? .7 : 1 }}
        >
          {busy ? 'Enviando…' : 'Enviar enlace de acceso'}
        </button>
      </form>

      <div className="text-center" style={{ color:'var(--brand-muted)' }}>o</div>

      <button
        onClick={signInWithGoogle}
        disabled={busy}
        className="w-full p-3 rounded-xl"
        style={{ background:'#fff', border:'1px solid var(--brand-border)', opacity: busy ? .7 : 1 }}
      >
        Continuar con Google
      </button>

      {msg && (
        <div className="p-3 rounded-lg text-sm" style={{ background:'#F2FFE8', border:'1px solid #CBE7B6', color:'#2D6A1F' }}>
          {msg}
        </div>
      )}
      {err && (
        <div className="p-3 rounded-lg text-sm" style={{ background:'#FDECEC', border:'1px solid #F5B3B1', color:'#C63934' }}>
          {err}
        </div>
      )}
    </main>
  );
}
