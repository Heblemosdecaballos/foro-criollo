'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Author = {
  username: string | null;
};

type Thread = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  author?: Author | null;
};

type Post = {
  id: string;
  body: string;
  created_at: string;
  author?: Author | null;
};

export default function ThreadPage({ params }: { params: { id: string } }) {
  const threadId = params.id;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setMsg(null);

    // Cargar hilo con autor embebido
    const { data: t, error: tErr } = await supabase
      .from('threads')
      .select(
        `
        id, title, category, created_at,
        author:created_by ( username )
      `
      )
      .eq('id', threadId)
      .single();

    if (tErr) {
      setMsg(tErr.message);
    } else {
      setThread(t as unknown as Thread);
    }

    // Cargar posts del hilo con autor embebido
    const { data: p, error: pErr } = await supabase
      .from('posts')
      .select(
        `
        id, body, created_at,
        author:created_by ( username )
      `
      )
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (pErr) {
      setMsg(pErr.message);
      setPosts([]);
    } else {
      setPosts((p ?? []) as unknown as Post[]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  async function handlePublish() {
    try {
      setLoading(true);
      setMsg(null);

      // Debes estar logueado
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Debes iniciar sesión');

      // Buscar el profile.id del usuario
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (profErr) throw profErr;
      if (!prof) throw new Error('Perfil no encontrado. Completa tu perfil.');

      if (!body.trim()) throw new Error('Escribe tu respuesta');

      // Insertar post con body y created_by (profiles.id)
      const { error: insErr } = await supabase.from('posts').insert({
        thread_id: threadId,
        body,
        created_by: prof.id,
      });
      if (insErr) throw insErr;

      setBody('');
      await load();
    } catch (e: any) {
      setMsg(e.message ?? 'Error publicando la respuesta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <Link className="underline" href="/">
          Volver
        </Link>
      </div>

      {msg && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {msg}
        </p>
      )}

      {thread ? (
        <>
          <h1 className="mb-1 text-2xl font-semibold">{thread.title}</h1>
          <div className="mb-6 text-sm text-neutral-500">
            @{thread.author?.username ?? 'usuario'} •{' '}
            {new Date(thread.created_at).toLocaleString()} •{' '}
            <span className="rounded bg-neutral-100 px-2 py-0.5">
              {thread.category}
            </span>
          </div>

          {/* Lista de respuestas */}
          <div className="space-y-4">
            {posts.map((p) => (
              <article
                key={p.id}
                className="rounded border border-neutral-200 p-4"
              >
                <div className="mb-2 text-sm text-neutral-500">
                  @{p.author?.username ?? 'usuario'} •{' '}
                  {new Date(p.created_at).toLocaleString()}
                </div>
                <p className="whitespace-pre-wrap">{p.body}</p>
              </article>
            ))}
          </div>

          {/* Agregar respuesta */}
          <section className="mt-8">
            <h2 className="mb-2 text-lg font-medium">Agregar respuesta</h2>
            <textarea
              className="h-32 w-full rounded border border-neutral-300 p-3 outline-none focus:border-black"
              placeholder="Escribe tu respuesta..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <button
              disabled={loading}
              onClick={handlePublish}
              className="mt-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? 'Publicando…' : 'Publicar respuesta'}
            </button>
          </section>
        </>
      ) : (
        <p>Cargando tema…</p>
      )}
    </main>
  );
}
