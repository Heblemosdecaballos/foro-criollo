'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get('redirect') || '/'; // <- Destino al terminar

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya estoy logueado, entro directo al destino
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(redirect);
    });
  }, [redirect, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) return setMsg(error.message);

    router.replace(redirect); // <- Vamos al hilo original (o a '/')
  }

  return (
    <main className="min-h-screen max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ingresar</h1>

      {msg && <p className="text-sm text-red-600">{msg}</p>}

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Tu correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full border rounded p-2 font-medium" disabled={loading} type="submit">
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p className="text-sm text-neutral-600">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="underline">Crear una</Link>
      </p>
    </main>
  );
}
