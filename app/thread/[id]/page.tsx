'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';

// ⚠️ Variables de entorno requeridas en .env.local
// NEXT_PUBLIC_SUPABASE_URL=...
// NEXT_PUBLIC_SUPABASE_ANON_KEY=...
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnon);

type PostRow = {
  id: string;
  thread_id: string;
  body: string;
  created_at: string;
  author_id: string | null;
  author_username: string | null;
};

export default function ThreadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState<string>('Hilo');
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [cursor, setCursor] = useState<{ created_at: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [body, setBody] = useState('');
  const fetchingRef = useRef(false); // evita dobles cargas

  async function loadMeta() {
    try {
      const { data, error } = await supabase
        .from('v_threads_compact')
        .select('title')
        .eq('id', id)
        .single();
      if (error) throw error;
      setTitle((data as any)?.title ?? 'Hilo');
    } catch (e) {
      // silencioso: dejamos el título por defecto
      console.warn('No se pudo cargar el título del hilo.');
    }
  }

  async function loadPosts(useCursor: boolean) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      let q = supabase
        .from('v_posts_with_author')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(30);

      if (useCursor && cursor) {
        // keyset pagination: pedimos más antiguos que el cursor actual
        q = q.lt('created_at', cursor.created_at)
             .or(`created_at.eq.${cursor.created_at},id.lt.${cursor.id}`);
      }

      const { data, error } = await q;
      if (error) throw error;

      const list = (data ?? []) as PostRow[];
      const next = list.length
        ? { created_at: list[list.length - 1].created_at, id: list[list.length - 1].id }
        : null;

      setPosts(prev => (useCursor ? [...prev, ...list] : list));
      setCursor(next);
      setInitialized(true);
    } catch (e: any) {
      console.error('Error listando respuestas:', e?.message || e);
      alert('No se pudieron cargar las respuestas. Intenta nuevamente.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }

  async function sendReply() {
    const clean = body.trim();
    if (!clean) return;
    setLoading(true);
    try {
      // Publicar respuesta usando RPC seguro (usa auth.uid() en el servidor)
      const { error } = await supabase.rpc('create_post', { p_thread_id: id, p_body: clean });
      if (error) throw error;
      setBody('');
      // recarga la primera página para ver la respuesta arriba
      await loadPosts(false);
    } catch (e: any) {
      console.error('Error publicando respuesta:', e?.message || e);
      alert(e?.message || 'No se pudo publicar la respuesta.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeta();
    loadPosts(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-neutral-600">Participa en el hilo. Las respuestas se cargan en bloques para ir ligero.</p>
      </header>

      {/* Formulario de respuesta */}
      <section className="border rounded-lg p-3 space-y-2">
        <textarea
          className="w-full border rounded p-2 min-h-[100px]"
          placeholder="Escribe tu respuesta…"
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply(); }}
        />
        <div className="flex justify-end">
          <button
            onClick={sendReply}
            disabled={loading || !body.trim()}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            Responder
          </button>
        </div>
      </section>

      {/* Lista de respuestas */}
      <ul className="space-y-3">
        {posts.map(p => (
          <li key={p.id} className="border rounded-lg p-3">
            <div className="text-sm text-neutral-600">
              @{p.author_username ?? 'usuario'} • {new Date(p.created_at).toLocaleString()}
            </div>
            <div className="mt-1 whitespace-pre-wrap">{p.body}</div>
          </li>
        ))}
      </ul>

      {/* Paginación */}
      <div className="mt-2 flex justify-center">
        <button
          onClick={() => loadPosts(true)}
          disabled={loading || (initialized && cursor === null)}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {loading ? 'Cargando…' : (initialized && cursor === null ? 'No hay más' : 'Cargar más')}
        </button>
      </div>
    </main>
  );
}
