'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  phone: string | null;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!user) {
          setMsg('Debes iniciar sesión para editar tu perfil.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, phone')
          .eq('id', user.id)
          .maybeSingle<Profile>();
        if (error) throw error;

        if (mounted && data) {
          setUsername(data.username ?? '');
          setFullName(data.full_name ?? '');
          setPhone(data.phone ?? '');
        }
      } catch (e: any) {
        setMsg(e.message ?? 'No fue posible cargar tu perfil.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    try {
      setMsg(null);
      setSaving(true);

      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Debes iniciar sesión');

      const payload = {
        id: user.id,
        username: username.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(payload, {
        onConflict: 'id',
      });
      if (error) throw error;

      setMsg('Perfil actualizado ✅');
    } catch (e: any) {
      // Error típico si username ya existe por el índice único
      if (typeof e.message === 'string' && e.message.toLowerCase().includes('duplicate')) {
        setMsg('Ese nombre de usuario ya está en uso. Prueba con otro.');
      } else {
        setMsg(e.message ?? 'No fue posible guardar.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-4">
        <p>Cargando perfil…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-4">
      <div className="mb-4">
        <Link className="text-sm underline" href="/">
          ← Volver
        </Link>
      </div>

      <h1 className="mb-4 text-2xl font-bold">Perfil</h1>

      {msg && (
        <div className="mb-4 rounded border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
          {msg}
        </div>
      )}

      <div className="grid gap-4 sm:max-w-lg">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Usuario *</span>
          <input
            className="rounded border p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tu-usuario"
          />
          <span className="text-xs text-neutral-500">
            Debe ser único. Solo letras/números/guiones (recomendado).
          </span>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Nombre completo</span>
          <input
            className="rounded border p-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Teléfono *</span>
          <input
            className="rounded border p-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+57 3xx xxx xxxx"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <Link href="/" className="underline">
            Cancelar
          </Link>
        </div>
      </div>
    </main>
  );
}
