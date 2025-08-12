'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Thread = {
  id: string;
  title: string;
  category: string;
  created_at?: string;
  created_by?: string;
};

type Post = {
  id: string;
  content: string;
  thread_id: string;
  created_at: string;
  user_id?: string;
  parent_id?: string | null;
};

export default function ThreadPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);

      // Tema
      const { data: th } = await supabase
        .from('threads')
        .select('*')
        .eq('id', id)
        .single();

      setThread((th as Thread) ?? null);

      // Respuestas del tema
      const { data: po } = await supabase
        .from('posts')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: true });

      setPosts((po as Post[]) ?? []);
      setLoading(false);
    })();
  }, [id]);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="mx-auto max-w-3xl p-6">
        <Link className="underline" href="/">Volver</Link>
      </div>

      {loading && <p className="mt-6">Cargando tema…</p>}

      {!loading && thread && (
        <>
          <h1 className="text-2xl font-semibold">{thread.title}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Categoría: {thread.category}
          </p>

          <div className="mt-6 space-y-4">
            {posts.map((p) => (
              <div key={p.id} className="rounded border p-3">
                {p.content}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
