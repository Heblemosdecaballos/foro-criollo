'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Thread = {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
  created_by: string;
};

type Profile = {
  user_id: string;
  username: string | null;
};

const PAGE_SIZE = 10;

export default function HomePage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [byUser, setByUser] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // mostrar banner "completa tu perfil" si no tiene username
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u?.user?.id) {
          const { data: p } = await supabase
            .from('profiles')
            .select('user_id, username')
            .eq('user_id', u.user.id)
            .maybeSingle();
          setNeedsProfile(!p?.username);
        } else {
          setNeedsProfile(false);
        }
      } catch {
        setNeedsProfile(false);
      }
    })();
  }, []);

  useEffect(() => {
    // carga inicial
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMore() {
    try {
      if (loading || !hasMore) return;
      setLoading(true);
      setErr(null);

      const from = page * PAGE_SIZE;
      const to   = from + PAGE_SIZE; // pedimos uno extra para saber si hay más

      const { data, error } = await supabase
        .from('threads')
        .select('id, title, category, created_at, created_by')
        .order('created_at', { ascending: false })
        .range(from, to); // pedimos PAGE_SIZE+1 (porque to es inclusivo)

      if (error) throw error;

      const rows = data ?? [];
      // si recibimos más de PAGE_SIZE, hay más páginas
      const newHasMore = rows.length > PAGE_SIZE;
      setHasMore(newHasMore);

      const slice = newHasMore ? rows.slice(0, PAGE_SIZE) : rows;

      // perfiles faltantes
      const missingIds = slice
        .map(t => t.created_by)
        .filter((id, idx, arr) => arr.indexOf(id) === idx && !byUser[id]);

      if (missingIds.length) {
        const { data: profs, error: pErr } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', missingIds);
        if (!pErr && profs) {
          const mapAdd: Record<string, string> = {};
          profs.forEach((p: Profile) => (mapAdd[p.user_id] = p.username ?? 'usuario'));
          setByUser(prev => ({ ...prev, ...mapAdd }));
        }
      }

      setThreads(prev => [...prev, ...slice]);
      setPage(prev => prev + 1);
    } catch (e: any) {
      console.error(e);
      setErr(e.message ?? 'Error cargando temas');
    } finally {
      setLoading(false);
    }
  }

  const canLoad = useMemo(() => hasMore && !loading, [hasMore, loading]);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Últimos temas</h1>
        <Link
          href="/new-thread"
          className="px-3 py-1 rounded border hover:bg-neutral-50"
        >
          Crear tema
        </Link>
      </header>

      {needsProfile && (
        <div className="border-amber-300 bg-amber-50 text-amber-800 border rounded p-3">
          Para participar, por favor <Link href="/profile" className="underline">completa tu perfil</Link>.
        </div>
      )}

      {err && <div className="text-red-600">{err}</div>}

      <section className="space-y-4">
        {threads.length === 0 && !loading && <p className="text-neutral-500">No hay temas todavía.</p>}

        {threads.map(t => (
          <article key={t.id} className="border rounded p-3">
            <h2 className="font-medium">
              <Link href={`/thread/${t.id}`} className="underline">{t.title}</Link>
            </h2>
            <div className="text-sm text-neutral-500 flex items-center gap-2">
              <span>@{byUser[t.created_by] ?? 'usuario'}</span>
              <span>·</span>
              <span>{new Date(t.created_at).toLocaleString()}</span>
              {t.category && (
                <>
                  <span>·</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100">{t.category}</span>
                </>
              )}
            </div>
          </article>
        ))}
      </section>

      <div className="pt-2">
        {canLoad ? (
          <button className="px-3 py-1 rounded border" onClick={loadMore}>
            Cargar más
          </button>
        ) : (
          <p className="text-neutral-400 text-sm">
            {loading ? 'Cargando…' : 'No hay más resultados'}
          </p>
        )}
      </div>
    </main>
  );
}
