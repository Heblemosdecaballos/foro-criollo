'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('redirectTo') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      router.push(redirectTo);
    } catch (err: any) {
      setMsg(err?.message ?? 'Error al ingresar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ingresar</h1>

      {msg && <div className="rounded-md border p-3 text-sm">{msg}</div>}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Correo</label>
          <input className="w-full rounded border px-3 py-2"
                 type="email" value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="tucorreo@dominio.com" required />
        </div>

        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input className="w-full rounded border px-3 py-2"
                 type="password" value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Tu contraseña" required />
        </div>

        <button disabled={loading}
                className="w-full rounded bg-black text-white py-2 disabled:opacity-50"
                type="submit">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-sm">
        ¿No tienes cuenta? <Link className="underline" href="/register">Crear cuenta</Link>
      </p>
    </div>
  );
}
