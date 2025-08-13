'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ReportedPost = {
  id: string;
  thread_id: string;
  body: string;
  created_at: string;
  author_id: string | null;
  author_username: string | null;
  is_hidden?: boolean;
  reports_count?: number | null;
};

type Cursor = { created_at: string; id: string } | null;

export default function ReportsPage() {
  const [isMod, setIsMod] = useState<boolean | null>(null);
  const [items, setItems] = useState<ReportedPost[]>([]);
  const [cursor, setCursor] = useState<Cursor>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const fetchingRef = useRef(false);

  // Filtros
  const [q, setQ] = useState('');
  const [hidden, setHidden] = useState<'all' | 'hidden' | 'visible'>('all');
  const [minReports, setMinReports] = useState(1);
  const [from, setFrom] = useState<string>(''); // ISO date (YYYY-MM-DD)
  const [to, setTo] = useState<string>('');

  async function checkMod() {
    try {
      const { data, error } = await supabase.rpc('is_moderator');
      if (error) throw error;
      setIsMod(!!data);
    } catch {
      setIsMod(false);
    }
  }

  // Construye filtros para Supabase
  function applyFilters(query: ReturnType<typeof supabase.from<any>>) {
    let qy = query;

    // Sólo posts con reportes (el reporte viene desde la vista)
    qy = qy.gte('reports_count', minReports);

    if (hidden === 'hidden') qy = qy.eq('is_hidden', true);
    if (hidden === 'visible') qy = qy.eq('is_hidden', false);

    if (q.trim()) {
      // Búsqueda básica en body y autor (OR)
      const text = q.trim();
      qy = qy.or(`body.ilike.%${text}%,author_username.ilike.%${text}%`);
    }

    if (from) qy = qy.gte('created_at', new Date(from).toISOString());
    if (to) {
      // incluir todo el día "to"
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      qy = qy.lte('created_at', end.toISOString());
    }

    return qy;
  }

  async function fetchPage(useCursor: boolean) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      let qy = supabase
        .from('v_posts_with_author')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(30);

      qy = applyFilters(qy);

      if (useCursor && cursor) {
        qy = qy.lt('created_at', cursor.created_at)
               .or(`created_at.eq.${cursor.created_at},id.lt.${cursor.id}`);
      }

      const { data, error } = await qy;
      if (error) throw error;

      const list = (data ?? []) as ReportedPost[];
      const next: Cursor = list.length
        ? { created_at: list[list.length - 1].created_at, id: list[list.length - 1].id }
        : null;

      setItems(prev => (useCursor ? [...prev, ...list] : list));
      setCursor(next);
      setInitialized(true);
    } catch (e: any) {
      console.error('Error listando reportes:', e?.message || e);
      alert('No se pudieron cargar los reportes. Intenta nuevamente.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }

  // Acciones moderación (via API handlers que ya creaste)
  async function toggleHide(postId: string, currentHidden?: boolean) {
    const res = await fetch('/api/moderate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, hidden: !currentHidden }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || 'Acción no permitida.');
      return;
    }
    await fetchPage(false);
  }

  async function pinPost(threadId: string, postId: string) {
    const res = await fetch('/api/pin-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, postId }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || 'No se pudo anclar.');
      return;
    }
    alert('Post anclado.');
  }

  async function unpinThread(threadId: string) {
    const res = await fetch('/api/unpin-thread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || 'No se pudo desanclar.');
      return;
    }
    alert('Hilo desanclado.');
  }

  // Resetear paginación al cambiar filtros
  useEffect(() => {
    if (isMod === false) return;
    fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, hidden, minReports, from, to, isMod]);

  useEffect(() => {
    checkMod();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canShow = useMemo(() => isMod === true, [isMod]);

  if (isMod === null) {
    return <main className="max-w-4xl mx-auto p-4">Verificando permisos…</main>;
  }

  if (!canShow) {
    return (
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-xl font-semibold">Reportes</h1>
        <p className="text-sm text-red-600 mt-2">Solo moderadores pueden ver esta página.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Reportes de la comunidad</h1>
        <p className="text-sm text-neutral-600">Revisa y actúa sobre los posts con más reportes.</p>
      </header>

      {/* Filtros */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <input
          className="border rounded px-3 py-2"
          placeholder="Buscar en texto o autor…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={hidden}
          onChange={e => setHidden(e.target.value as any)}
        >
          <option value="all">Todos</option>
          <option value="visible">Solo visibles</option>
          <option value="hidden">Solo ocultos</option>
        </select>
        <input
          type="number"
          min={1}
          className="border rounded px-3 py-2"
          value={minReports}
          onChange={e => setMinReports(Math.max(1, Number(e.target.value || 1)))}
          placeholder="Mín. reportes"
          title="Mínimo de reportes"
        />
        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={from}
            onChange={e => setFrom(e.target.value)}
            title="Desde"
          />
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={to}
            onChange={e => setTo(e.target.value)}
            title="Hasta"
          />
        </div>
      </section>

      {/* Lista */}
      <ul className="space-y-3">
        {items.map(p => (
          <li key={p.id} className="border rounded-lg p-3">
            <div className="text-sm text-neutral-600 flex items-center justify-between gap-2">
              <span>
                <a href={`/threads/${p.thread_id}`} className="underline mr-2">Ir al hilo</a>
                @{p.author_username ?? 'usuario'} • {new Date(p.created_at).toLocaleString()}
              </span>
              <span className="text-xs">Reportes: {p.reports_count ?? 0}</span>
            </div>

            {p.is_hidden && (
              <div className="mt-1 text-xs text-red-600">Oculto actualmente</div>
            )}

            <div className={`mt-2 whitespace-pre-wrap ${p.is_hidden ? 'opacity-60' : ''}`}>
              {p.body}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => toggleHide(p.id, p.is_hidden)}
                className="px-3 py-1 border rounded"
                title={p.is_hidden ? 'Mostrar post' : 'Ocultar post'}
              >
                {p.is_hidden ? 'Mostrar' : 'Ocultar'}
              </button>

              <button
                onClick={() => pinPost(p.thread_id, p.id)}
                className="px-3 py-1 border rounded"
                title="Anclar en el hilo"
              >
                Anclar
              </button>

              <button
                onClick={() => unpinThread(p.thread_id)}
                className="px-3 py-1 border rounded"
                title="Desanclar hilo"
              >
                Desanclar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Paginación */}
      <div className="mt-2 flex justify-center">
        <button
          onClick={() => fetchPage(true)}
          disabled={loading || (initialized && cursor === null)}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {loading ? 'Cargando…' : (initialized && cursor === null ? 'No hay más' : 'Cargar más')}
        </button>
      </div>
    </main>
  );
}
