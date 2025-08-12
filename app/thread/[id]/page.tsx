'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Author = { username: string | null };
type Post = {
  id: string;
  content: string;          // ← usamos content
  created_at: string;
  author: Author;
};
type Thread = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  author: Author;
};

export default function ThreadPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Cargar tema y respuestas
  useEffect(() => {
    (async () => {
      // Tema
      const { data: th, error: e1 } = await supabase
        .from('threads')
        .select(`
          id, title, category, created_at,
          author:profiles!threads_created_by_fkey ( username )
        `)
        .eq('id', id)
        .maybeSingle();

      if (e1) { setMsg(e1.message); return; }
      setThread(th as unknown as Thread);

      // Respuestas
      const { data: ps, error: e2 } = await supabase
        .from('posts')
        .select(`
          id, content, created_at,
          author:profiles!posts_created_by_fkey ( username )
        `)
        .eq('thread_id', id)
        .order('created_at', { ascending: true });

      if (e2) { setMsg(e2.message); return; }
      setPosts((ps as unknown as Post[]) ?? []);
    })();
  }, [id]);

  async function publish() {
    setMsg(null);
    if (!text.trim()) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg('Debes iniciar sesión'); setLoading(false); return; }

    // INSERT: usar content (no body)
    const { error } = await supabase.from('posts').insert({
      thread_id: id,
      content: text.trim(),
      created_by: user.id,
    });

    if (error) {
      setMsg(error.message);
    } else {
      setText('');
      // Recargar respuestas
      const { data: ps } = await supabase
        .from('posts')
        .select(`
          id, content, created_at,
          author:profiles!posts_created_by_fkey ( username )
        `)
        .eq('thread_id', id)
        .order('created_at', { ascending: true });

      setPosts((ps as unknown as Post[]) ?? []);
    }
    setLoading(false);
  }

  if (!thread) return <p>Cargando tema...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="underline">Volver</Link>

      {msg && (
        <p className="my-3 rounded bg-rose-50 px-3 py-2 text-rose-700">{msg}</p>
      )}

      <h1 className="mt-3 text-2xl font-semibold">{thread.title}</h1>
      <div className="text-sm text-neutral-500">
        @{thread.author?.username ?? 'usuario'} ·{' '}
        {new Date(thread.created_at).toLocaleString()} · {thread.category}
      </div>

      <div className="mt-6 space-y-4">
        {posts.map((p) => (
          <div key={p.id} className="rounded border p-3">
            <div className="mb-1 text-xs text-neutral-500">
              @{p.author?.username ?? 'usuario'} ·{' '}
              {new Date(p.created_at).toLocaleString()}
            </div>
            <p>{p.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="mb-2 font-medium">Agregar respuesta</h3>
        <textarea
          className="h-28 w-full rounded border p-2"
          placeholder="Escribe tu respuesta…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="mt-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          onClick={publish}
          disabled={loading}
        >
          {loading ? 'Publicando…' : 'Publicar respuesta'}
        </button>
      </div>
    </div>
  );
}
