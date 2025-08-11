'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Si ya hay sesión, redirige al inicio
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/');
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);
    router.push('/'); // listo
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);
    setMsg('Cuenta creada. Ya puedes ingresar con tu correo y contraseña.');
    setMode('login');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <main className="min-h-screen max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ingresar</h1>

      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded border ${mode === 'login' ? 'bg-black text-white' : ''}`}
          onClick={() => setMode('login')}
        >
          Ya tengo cuenta
        </button>
        <button
          className={`px-3 py-1 rounded border ${mode === 'signup' ? 'bg-black text-white' : ''}`}
          onClick={() => setMode('signup')}
        >
          Crear cuenta
        </button>
      </div>

      {msg && <p className="text-sm text-red-600">{msg}</p>}

      <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button
          className="w-full border rounded p-2 font-medium"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Procesando…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>
      </form>

      <div className="pt-4">
        <button className="text-sm underline" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
