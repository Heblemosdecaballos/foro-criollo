// app/thread/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Author = { username: string | null };
type Post = {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  author: Author | null;
};
type Thread = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  author: Author | null;
};

export default function ThreadPage({ params }: { params: { id: string } }) {
  const threadId = params.id;
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setMsg(null);

    const [{ data: th, error: e1 }, { data: po, error: e2 }] = await Promise.all([
      supabase
        .from('threads')
        .select(`
          id, title, category, created_at,
          author:profiles!threads_created_by_profiles_fk ( username )
        `)
        .eq('id', threadId)
        .single(),
      supabase
        .from('posts')
        .select(`
          id, content, created_at, parent_id,
          author:profiles!posts_created_by_profiles_fk ( username )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true }),
    ]);

    if (e1) setMsg(e1.message);
    else setThread(th as Thread);

    if (e2) setMsg((m) => m ?? e2.message);
    else setPosts((po ?? []) as Post[]);
  }

  useEffect(() => {
    load();
  }, [threadId]);

  async function submit() {
    try {
      setBusy(true);
      setMsg(null);

      const {
        data: { user },
        error: uerr,
      } = await supabase.auth.getUser();
      if (uerr) throw uerr;
      if (!user) throw new Error('Debes iniciar sesión');

      const { error } = await supabase.from('posts').insert({
        thread_id: threadId,
        content,
        created_by: user.id,
        parent_id: null, // o el id del comentario padre si implementas respuestas anidadas
      });

      if (error) throw error;

      setContent('');
      await load();
    } catch (e: any) {
      setMsg(e.message ?? 'No se pudo publicar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="underline">
        Volver
      </Link>

      {msg && <p className="mt-2 text-red-600">{msg}</p>}

      {thread && (
        <>
          <h1 className="mt-3 text-2xl font-semibold">{thread.title}</h1>
          <div className="mt-1 text-sm text-neutral-600">
            {thread.author?.username ?? 'anónimo'} · {thread.category}
          </div>
        </>
      )}

      <section className="mt-6 space-y-4">
        {posts.map((p) => (
          <article key={p.id} className="rounded border p-3">
            <div className="mb-1 text-sm text-neutral-600">
              {p.author?.username ?? 'anónimo'}
            </div>
            <p>{p.content}</p>
          </article>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 font-medium">Agregar respuesta</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tu respuesta…"
          className="w-full resize-y rounded border p-3"
          rows={4}
        />
        <button
          onClick={submit}
          disabled={busy || !content.trim()}
          className="mt-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Publicar respuesta
        </button>
      </section>
    </main>
  );
}
