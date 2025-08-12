'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function PerfilPage() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }
      const { data, error: e2 } = await supabase
        .from('profiles')
        .select('username, phone')
        .eq('id', user.id)
        .maybeSingle();

      if (!e2 && data) {
        setUsername(data.username ?? '');
        setPhone(data.phone ?? '');
      }
      setLoading(false);
    })();
  }, [router]);

  async function save() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim() || null,
          phone: phone.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      setMsg('Perfil actualizado ✅');
      // vuelve al inicio
      setTimeout(() => router.push('/'), 800);
    } catch (e: any) {
      setMsg(e.message ?? 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Completa tu perfil</h1>

      {msg && <p className="mb-4 text-sm text-amber-700">{msg}</p>}

      <label className="mb-2 block text-sm font-medium">Usuario</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-4 w-full rounded border p-2"
        placeholder="tu_usuario"
      />

      <label className="mb-2 block text-sm font-medium">Teléfono</label>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="mb-6 w-full rounded border p-2"
        placeholder="+57 300 000 0000"
      />

      <button
        disabled={loading}
        onClick={save}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Guardando…' : 'Guardar'}
      </button>
    </main>
  );
}
