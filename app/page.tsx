'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ThreadRow = {
  id: string;
  title: string;
  created_at: string;
  author_id: string | null;
  author_username: string | null;
  posts_count: number | null;
  last_post_by: string | null;
  last_post_at: string | null;
  // category está en la tabla base; la vista compacta puede no exponerla, así que no la exigimos
};

export default function ThreadsPage() {
  const [items, setItems] = useState<ThreadRow[]>([]);
  const [cursor, setCursor] = useState<{ created_at: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const fetchingRef = useRef(false);

  // filtros
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string | 'all'>('all');
  const [categories, setCategories] = useState<string[]>([]);

  const [title, setTitle] = useState('');

  async function ensureProfile() {
    try { await supabase.rpc('ensure_profile_min'); } catch {}
  }

  async function loadCategories() {
    try {
      const { data, error } = await supabase.rpc('threads_categories');
      if (!error && Array.isArray(data)) setCategories(data as string[]);
    } catch {}
  }

  async function fetchPage(useCursor: boolean) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      let qy = supabase
        .from('v_threads_compact')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(20);

      // filtros
      if (q.trim()) {
        // búsqueda por título (la vista expone title)
        qy = qy.ilike('title', `%${q.trim()}%`);
      }
      if (category !== 'all') {
        // como la vista quizá no trae category, filtramos vía RPC alternativa si lo necesita.
        // Si v_threads_compact no tiene category, quite esta eq y mantenga solo la búsqueda por título.
        qy = qy.eq('category', category); // funciona si su vista incluye category; si no, coméntela.
      }

      if (useCursor && cursor) {
        qy = qy.lt('created_at', cursor.created_at)
               .or(`created_at.eq.${cursor.created_at},id.lt.${cursor.id}`);
      }

      const { data, error } = await qy;
      if (error) throw error;

      const list = (data ?? []) as ThreadRow[];
      const next = list.length
        ? { created_at: list[list.length - 1].created_at, id: list[list.length - 1].id }
        : null;

      setItems(prev => (useCursor ? [...prev, ...list] : list));
      setCursor(next);
      setInitialized(true);
    } catch (e: any) {
      console.error('Error listando hilos:', e?.message || e);
      alert('No se pudieron cargar los hilos. Intenta nuevamente.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }

  async function createThread() {
    const clean = title.trim();
    if (!clean) return;
    setLoading(true);
    try {
      // category se deja al DEFAULT válido del servidor
      const { error } = await supabase.rpc('create_thread', { p_title: clean });
      if (error) throw error;
      setTitle('');
      await fetchPage(false);
    } catch (e: any) {
      alert(e?.message || 'No se pudo crear el hilo.');
    } finally {
      setLoading(false);
    }
  }

  // resetear paginación al cambiar filtros
  useEffect(() => {
    fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category]);

  useEffect(() => {
    ensureProfile();
    loadCategories();
    fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Hablemos de Caballos — Foros</h1>
        <p className="text-sm text-neutral-600">Busca por título, filtra por categoría y publica nuevos hilos.</p>
      </header>

      {/* Filtros */}
      <section className="flex flex-col sm:flex-row gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Buscar por título…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 w-full sm:w-[220px]"
          value={category}
          onChange={e => setCategory(e.target.value as any)}
        >
          <option value="all">Todas las categorías</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </section>

      {/* Crear hilo */}
      <section className="flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Título del hilo…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') createThread(); }}
        />
        <button
          onClick={createThread}
          disabled={loading || !title.trim()}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          Publicar
        </button>
      </section>

      {/* Lista de hilos */}
      <ul className="space-y-3">
        {items.map(t => (
          <li key={t.id} className="border rounded-lg p-3">
            <a href={`/threads/${t.id}`} className="font-medium hover:underline">
              {t.title}
            </a>
            <div className="text-sm text-neutral-600">
              por @{t.author_username ?? 'usuario'} • {new Date(t.created_at).toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500">
              {(t.posts_count ?? 0)} respuestas
              {t.last_post_at ? (
                <> • Última: @{t.last_post_by ?? 'usuario'} • {new Date(t.last_post_at).toLocaleString()}</>
              ) : null}
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
