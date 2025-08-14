'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Cliente supabase en el navegador
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
  // Estas dos son opcionales: si tu vista las tiene, se mostrarán
  has_pinned?: boolean | null;
  reports_count?: number | null;
};

export default function ThreadsPage() {
  const [items, setItems] = useState<ThreadRow[]>([]);
  const [cursor, setCursor] = useState<{ created_at: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [q, setQ] = useState('');
  const [title, setTitle] = useState('');
  const fetchingRef = useRef(false);

  async function ensureProfile() {
    // No es crítico: si existe el RPC, bien; si no, seguimos igual.
    try { await supabase.rpc('ensure_profile_min'); } catch {}
  }

  async function fetchPage(useCursor: boolean) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      let qy: any = supabase
        .from('v_threads_compact')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(20);

      if (q.trim()) {
        qy = qy.ilike('title', `%${q.trim()}%`);
      }

      if (useCursor && cursor) {
        // Paginación estable: (created_at, id)
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
      // El DEFAULT de category ya está alineado, así que no enviamos categoría
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

  // Cargar página inicial y asegurar perfil mínimo
  useEffect(() => {
    ensureProfile();
    fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resetear paginación al cambiar la búsqueda
  useEffect(() => {
    fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Hablemos de Caballos — Foros</h1>
        <p className="text-sm text-neutral-600">Busca por título, crea hilos y navega con paginación.</p>
      </header>

      {/* Búsqueda */}
      <section className="flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Buscar por título…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
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
        {items.map(t => {
          const rep = t.reports_count ?? 0;
          return (
            <li key={t.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <a href={`/threads/${t.id}`} className="font-medium hover:underline">
                  {t.title}
                </a>

                <div className="flex items-center gap-2">
                  {t.has_pinned ? (
                    <span className="text-xs px-2 py-1 rounded-full border bg-yellow-50">
                      📌 Anclado
                    </span>
                  ) : null}
                  {rep > 0 ? (
                    <span className="text-xs px-2 py-1 rounded-full border border-red-300 text-red-600">
                      ⚠︎ {rep} reportes
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="text-sm text-neutral-600 mt-1">
                por @{t.author_username ?? 'usuario'} • {new Date(t.created_at).toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500">
                {(t.posts_count ?? 0)} respuestas
                {t.last_post_at ? (
                  <> • Última: @{t.last_post_by ?? 'usuario'} • {new Date(t.last_post_at).toLocaleString()}</>
                ) : null}
              </div>
            </li>
          );
        })}
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
