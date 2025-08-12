'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Thread = {
  id: string;
  title: string;
  category: string;
  created_by: string;
};

type Post = {
  id: string;
  content: string;
  created_by: string;
  thread_id: string;
  parent_id: string | null;
  created_at: string;
};

export default function ThreadPage({ params: { id } }: { params: { id: string } }) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    const { data: t } = await supabase.from('threads').select('*').eq('id', id).maybeSingle();
    setThread(t as Thread | null);

    const { data: p } = await supabase
      .from('posts')
      .select('*')
      .eq('thread_id', id)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    setPosts((p as Post[]) ?? []);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setLoading(false);
      setErrorMsg('Debes iniciar sesión para responder.');
      return;
    }

    const { error } = await supabase.from('posts').insert({
      thread_id: id,
      content,
      created_by: auth.user.id,
      parent_id: null,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setContent('');
    await loadData();
  };

  if (!thread) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Link className="underline" href="/">
          Volver
        </Link>
        <p className="mt-6">Cargando tema…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link className="underline" href="/">
          Volver
        </Link>
        <span className="rounded bg-neutral-100 px-2 py-1 text-xs">{thread.category}</span>
      </div>

      <h1 className="mb-4 text-2xl font-semibold">{thread.title}</h1>

      <h2 className="mt-8 mb-2 text-lg font-medium">Respuestas</h2>
      {posts.length === 0 && <p className="text-sm text-neutral-500">Aún no hay respuestas.</p>}
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.id} className="rounded border p-3">
            <p className="whitespace-pre-wrap">{p.content}</p>
            <p className="mt-2 text-xs text-neutral-500">Por: {p.created_by}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 mb-2 font-medium">Agregar respuesta</h3>
      {errorMsg && <p className="mb-3 text-sm text-red-600">{errorMsg}</p>}
      <form onSubmit={publish}>
        <textarea
          className="h-28 w-full rounded border p-2"
          placeholder="Escribe tu respuesta…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          className="mt-2 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          type="submit"
          disabled={loading || content.trim().length === 0}
        >
          {loading ? 'Publicando…' : 'Publicar respuesta'}
        </button>
      </form>
    </div>
  );
}
