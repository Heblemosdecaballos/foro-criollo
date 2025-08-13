'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';

// ⚠️ Asegúrese de tener en .env.local:
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
  is_hidden?: boolean;
  reports_count?: number | null;
};

export default function ThreadDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState<string>('Hilo');
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [cursor, setCursor] = useState<{ created_at: string; id: string } | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState('');
  const fetchingRef = useRef(false);

  // Moderación / anclado
  const [isMod, setIsMod] = useState(false);
  const [pinned, setPinned] = useState<PostRow | null>(null);

  // ─────────────────────────────
  // Helpers de datos
  // ─────────────────────────────
  async function checkMod() {
    try {
      const { data, error } = await supabase.rpc('is_moderator');
      if (!error) setIsMod(!!data);
    } catch {
      // silencioso
    }
  }

  async function loadMeta() {
    try {
      const { data, error } = await supabase
        .from('v_threads_compact')
        .select('title')
        .eq('id', id)
        .single();
      if (error) throw error;
      setTitle((data as any)?.title ?? 'Hilo');
    } catch {
      // dejar título por defecto
    }
  }

  async function loadPinned() {
    try {
      // Obtener post anclado del hilo (pinned_post_id)
      const { data: t, error: tErr } = await supabase
        .from('threads') // requiere SELECT sobre threads
        .select('pinned_post_id')
        .eq('id', id)
        .maybeSingle();
      if (tErr) throw tErr;

      if (t?.pinned_post_id) {
        const { data: pp, error: pErr } = await supabase
          .from('v_posts_with_author')
          .select('*')
          .eq('id', t.pinned_post_id)
          .single();
        if (pErr) throw pErr;
        setPinned(pp as PostRow);
      } else {
        setPinned(null);
      }
    } catch {
      // silencioso
      setPinned(null);
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
        // keyset pagination: pedir más antiguos que el cursor actual
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

  // ─────────────────────────────
  // Acciones (publicar / reportar / ocultar / anclar / desanclar)
  // ─────────────────────────────
  async function sendReply() {
    const clean = body.trim();
    if (!clean) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('create_post', { p_thread_id: id, p_body: clean });
      if (error) throw error;
      setBody('');
      await loadPosts(false); // refrescar primeras 30
    } catch (e: any) {
      console.error('Error publicando respuesta:', e?.message || e);
      alert(e?.message || 'No se pudo publicar la respuesta.');
    } finally {
      setLoading(false);
    }
  }

  async function reportPost(postId: string) {
    try {
      const reason = prompt('Cuéntanos brevemente el motivo (opcional):') ?? null;
      const { error } = await supabase.rpc('report_post', { p_post_id: postId, p_reason: reason });
      if (error) throw error;
      alert('Gracias. Tu reporte fue registrado.');
      await loadPosts(false);
    } catch (e: any) {
      alert(e?.message || 'No se pudo reportar.');
    }
  }

  async function toggleHide(postId: string, currentHidden?: boolean) {
    try {
      const { error } = await supabase.rpc('mod_hide_post', { p_post_id: postId, p_hidden: !currentHidden });
      if (error) throw error;
      await loadPosts(false);
    } catch (e: any) {
      alert(e?.message || 'Acción no permitida.');
    }
  }

  async function pinPost(threadId: string, postId: string) {
    try {
      const { error } = await supabase.rpc('mod_pin_post', { p_thread_id: threadId, p_post_id: postId });
      if (error) throw error;
      alert('Post anclado en el hilo.');
      await loadPinned();
    } catch (e: any) {
      alert(e?.message || 'No se pudo anclar.');
    }
  }

  async function unpinThread(threadId: string) {
    try {
      const { error } = await supabase.rpc('mod_unpin_thread', { p_thread_id: threadId });
      if (error) throw error;
      await loadPinned();
    } catch (e: any) {
      alert(e?.message || 'No se pudo desanclar.');
    }
  }

  // ─────────────────────────────
  // Efectos iniciales
  // ─────────────────────────────
  useEffect(() => {
    checkMod();
    loadMeta();
    loadPinned();
    loadPosts(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─────────────────────────────
  // Render
  // ─────────────────────────────
  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-neutral-600">Participa en el hilo. Las respuestas se cargan en bloques para ir ligero.</p>
      </header>

      {/* Post anclado (si existe) */}
      {pinned && (
        <section className="border rounded-lg p-3 bg-yellow-50">
          <div className="text-xs text-neutral-600 mb-1">📌 Post anclado</div>
          <div className="text-sm text-neutral-600">
            @{pinned.author_username ?? 'usuario'} • {new Date(pinned.created_at).toLocaleString()}
          </div>
          <div className="mt-1 whitespace-pre-wrap">{pinned.body}</div>

          {isMod && (
            <div className="mt-2">
              <button
                onClick={() => unpinThread(pinned.thread_id)}
                className="text-xs underline"
              >
                Desanclar
              </button>
            </div>
          )}
        </section>
      )}

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
            <div className="text-sm text-neutral-600 flex items-center justify-between gap-2">
              <span>@{p.author_username ?? 'usuario'} • {new Date(p.created_at).toLocaleString()}</span>
              <div className="flex gap-2">
                {/* Usuario normal → puede reportar si el post no está oculto */}
                {!isMod && !p.is_hidden && (
                  <button
                    onClick={() => reportPost(p.id)}
                    className="text-xs underline"
                    title="Reportar"
                  >
                    Reportar
                  </button>
                )}

                {/* Moderador → puede ocultar/mostrar y anclar */}
                {isMod && (
                  <>
                    <button
                      onClick={() => toggleHide(p.id, p.is_hidden)}
                      className="text-xs underline"
                      title={p.is_hidden ? 'Mostrar' : 'Ocultar'}
                    >
                      {p.is_hidden ? 'Mostrar' : 'Ocultar'}
                    </button>

                    <button
                      onClick={() => pinPost(p.thread_id, p.id)}
                      className="text-xs underline"
                      title="Anclar"
                    >
                      Anclar
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Aviso si está oculto */}
            {p.is_hidden && !isMod && (
              <div className="mt-2 text-xs text-red-600">
                Ocultado por la comunidad ({p.reports_count ?? 0} reportes).
              </div>
            )}

            <div className={`mt-2 whitespace-pre-wrap ${p.is_hidden && !isMod ? 'opacity-50' : ''}`}>
              {p.body}
            </div>
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
