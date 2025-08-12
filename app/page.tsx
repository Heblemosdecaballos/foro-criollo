'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import ProfileGuard from '@/components/ProfileGuard';

type ThreadRow = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  created_by: string;
  profiles?: { username: string | null; avatar_url: string | null } | null; // join
};

export default function HomePage() {
  const [rows, setRows] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);
      try {
        // Trae temas + autor (username/avatar) vía relación por FK created_by
        const { data, error } = await supabase
          .from('threads')
          .select(
            'id, title, category, created_at, created_by, profiles:created_by ( username, avatar_url )'
          )
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRows((data as any) ?? []);
      } catch (e: any) {
        setMsg(e.message ?? 'No se pudo cargar la lista de temas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      {/* si quieres forzar perfil completo */}
      <ProfileGuard />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Últimos temas</h1>
        <Link
          href="/new-thread"
          className="px-2 py-1 text-sm rounded border hover:bg-neutral-50"
        >
          Crear tema
        </Link>
      </div>

      {msg && <p className="text-red-600 mb-4">{msg}</p>}
      {loading ? <p>Cargando…</p> : null}

      <ul className="space-y-3">
        {rows.map((t) => {
          const u = t.profiles?.username ?? 'usuario';
          const avatar = t.profiles?.avatar_url ?? '';
          return (
            <li key={t.id} className="rounded border p-3">
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={u || 'avatar'}
                    className="h-6 w-6 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-neutral-200" />
                )}
                <span>@{u || 'usuario'}</span>
                <span>•</span>
                <span>{new Date(t.created_at).toLocaleString()}</span>
                <span>•</span>
                <span className="px-2 py-0.5 text-xs rounded-full border">
                  {t.category}
                </span>
              </div>

              <Link
                href={`/thread/${t.id}`}
                className="block mt-2 text-lg font-semibold underline-offset-2 hover:underline"
              >
                {t.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
