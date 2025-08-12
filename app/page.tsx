// app/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Author = { username: string | null };

type ThreadRow = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  author: Author | Author[] | null;
};

type Thread = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  author: Author | null;
};

function pickAuthor(a: ThreadRow['author']): Author | null {
  if (!a) return null;
  return Array.isArray(a) ? a[0] ?? null : a;
}

const PAGE_SIZE = 20;

export default function HomePage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const from = useMemo(() => threads.length, [threads.length]);
  const to = useMemo(() => Math.max(threads.length + PAGE_SIZE - 1, 0), [threads.length]);

  useEffect(() => {
    // Carga inicial
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkProfile() {
    const { data: userRes } = await supabase.auth.getUser();
    if (userRes?.user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('username, phone')
        .eq('id', userRes.user.id)
        .maybeSingle();

      setProfileIncomplete(!prof?.username || !prof?.phone);
    } else {
      setProfileIncomplete(false);
    }
  }

  async function loadMore(reset = false) {
    try {
      setLoading(true);
      setMsg(null);

      if (reset) {
        // revisar perfil una sola vez al inicio
        await checkProfile();
      }

      const rangeFrom = reset ? 0 : from;
      const rangeTo = reset ? PAGE_SIZE - 1 : to;

      const { data, error, count } = await supabase
        .from('threads')
        .select(
          `
          id,
          title,
          category,
          created_at,
          author:profiles!threads_created_by_profiles_fk ( username )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(rangeFrom, rangeTo);

      if (error) throw error;

      const mapped = (data as ThreadRow[]).map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        created_at: r.created_at,
        author: pickAuthor(r.author),
      }));

      if (reset) {
        setThreads(mapped);
      } else {
        // Evitar duplicados si el usuario aprieta rápido
        const existing = new Set(threads.map((t) => t.id));
        const merged = [...threads, ...mapped.filter((m) => !existing.has(m.id))];
        setThreads(merged);
      }

      const total = count ?? 0;
      const current = (reset ? mapped.length : threads.length + mapped.length);
      setHasMore(current < total);
    } catch (e: any) {
      setMsg(e.message ?? 'Error cargando temas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      {profileIncomplete && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
          Para participar, por favor completa tu perfil (elige un nombre de usuario y teléfono).{' '}
          <Link href="/perfil" className="font-medium underline">
            Completar perfil
          </Link>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Últimos temas</h1>
        <Link href="/new-thread" className="rounded border px-2 py-1 text-sm">
          Crear tema
        </Link>
      </div>

      {msg && <p className="mb-3 text-red-600">{msg}</p>}

      <ul className="space-y-3">
        {threads.map((t) => (
          <li key={t.id} className="rounded border p-3">
            <Link href={`/thread/${t.id}`} className="font-medium underline">
              {t.title}
            </Link>
            <div className="mt-1 text-sm text-neutral-600">
              {t.author?.username ?? 'anónimo'} · {t.category}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-3">
        {hasMore ? (
          <button
            disabled={loading}
            onClick={() => loadMore(false)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            {loading ? 'Cargando…' : 'Cargar más'}
          </button>
        ) : (
          <span className="text-sm text-neutral-500">No hay más temas.</span>
        )}
      </div>
    </main>
  );
}
