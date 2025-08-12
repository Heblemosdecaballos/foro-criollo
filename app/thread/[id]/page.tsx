'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Thread = {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
};

type Post = {
  id: string;
  body: string;
  created_at: string;
  created_by: string | null;
};

export default function ThreadPage({ params }: { params: { id: string } }) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Cargar usuario (para habilitar el formulario)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Cargar tema + respuestas
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const [tRes, pRes] = await Promise.all([
        supabase
          .from('threads')
          .select('id, title, category, created_at')
          .eq('id', params.id)
          .single(),
        supabase
          .from('posts')
          .select('id, body, created_at, created_by')
          .eq('thread_id', params.id)
          .order('created_at', { ascending: true })
      ]);

      if (tRes.error) setErr(tRes.error.message);
      else setThread(tRes.data);

      if (pRes.error) setErr(pRes.error.message);
      else setPosts(pRes.data ?? []);

      setLoading(false);
    })();
  }, [params.id]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!userId) {
      setMsg('Necesitas iniciar sesión para responder.');
      return;
    }
    const body = reply.trim();
    if (body.length === 0) {
      setMsg('Escribe un comentario.');
      return;
    }

    setSending(true);
    const { data, error } = await supabase
      .from('posts')
      .insert({
        thread_id: params.id,
        body,
        created_by: userId
      })
      .select('id, body, created_at, created_by')
      .single();

    setSending(false);
    if (error) return setMsg(error.message);

    // Añadir al listado sin recargar
    setPosts((prev) => [...prev, data as Post]);
    setReply('');
  }

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tema</h1>
        <Link href="/" className="underline">Volver</Link>
      </header>

      {loading && <p>Cargando…</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}

      {!loading && !err && thread && (
        <>
          <article className="space-y-2">
            <h2 className="text-xl font-semibold">{thread.title}</h2>
            <div className="text-sm text-neutral-600">
              {thread.category ? `Categoría: ${thread.category} · ` : ''}
              {new Date(thread.created_at).toLocaleString()}
            </div>
          </article>

          <section className="space-y-3">
            <h3 className="font-semibold">Respuestas</h3>

            {posts.length === 0 && (
              <p className="text-neutral-600 text-sm">Aún no hay respuestas.</p>
            )}

            <ul className="space-y-3">
              {posts.map((p) => (
                <li key={p.id} className="rounded border p-3">
                  <p className="whitespace-pre-wrap">{p.body}</p>
                  <div className="text-xs text-neutral-500 mt-2">
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="pt-4 space-y-2">
            <h3 className="font-semibold">Agregar respuesta</h3>

            {!userId ? (
              <p>
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/thread/${params.id}`)}`}
                  className="underline"
                >
                  Inicia sesión
                </Link>{' '}
                para responder.
              </p>
            ) : (
              <form onSubmit={handleReply} className="space-y-2">
                {msg && <p className="text-sm text-red-600">{msg}</p>}
                <textarea
                  className="w-full border rounded p-2 min-h-[120px]"
                  placeholder="Escribe tu comentario…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <button
                  className="px-3 py-2 rounded border font-medium"
                  type="submit"
                  disabled={sending}
                >
                  {sending ? 'Enviando…' : 'Publicar respuesta'}
                </button>
              </form>
            )}
          </section>
        </>
      )}
    </main>
  );
}
