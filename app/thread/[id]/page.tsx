'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Thread = {
  id: string;
  title: string;
  category: string;
  created_at: string;
};

type Post = {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  created_by: string;
};

export default function ThreadPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // para nueva respuesta
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setMsg(null);

      const [tRes, pRes] = await Promise.all([
        supabase
          .from('threads')
          .select('id, title, category, created_at')
          .eq('id', id)
          .single(),
        supabase
          .from('posts')
          .select('id, content, created_at, parent_id, created_by')
          .eq('thread_id', id)
          .is('parent_id', null) // solo respuestas nivel 1
          .order('created_at', { ascending: true }),
      ]);

      if (cancelled) return;

      if (tRes.error) setMsg(tRes.error.message);
      else setThread(tRes.data);

      if (pRes.error) setMsg(pRes.error.message);
      else setPosts(pRes.data ?? []);

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handlePublish() {
    try {
      setPosting(true);
      setMsg(null);

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) throw userErr;
      if (!user) throw new Error('Debes iniciar sesión');

      if (!content.trim()) {
        throw new Error('Escribe algo antes de publicar.');
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          thread_id: id,
          content,
          parent_id: null,
          created_by: user.id,
        })
        .select('id, content, created_at, parent_id, created_by')
        .single();

      if (error) throw error;

      setPosts((prev) => [...prev, data]);
      setContent('');
    } catch (e: any) {
      setMsg(e.message ?? 'Error publicando la respuesta.');
    } finally {
      setPosting(false);
    }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="mx-auto max-w-3xl p-6">
        <Link className="underline" href="/">
          Volver
        </Link>
      </div>

      {loading && <p className="mt-6">Cargando tema…</p>}
      {msg && <p className="text-red-600">{msg}</p>}

      {thread && (
        <section className="space-y-2">
          <h1 className="text-xl font-semibold">{thread.title}</h1>
          <p className="text-sm text-neutral-500">
            {thread.category} · {new Date(thread.created_at).toLocaleString()}
          </p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-medium">Respuestas</h2>

        {posts.length === 0 && !loading && <p>No hay respuestas aún.</p>}

        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="border rounded p-3">
              <p>{p.content}</p>
              <div className="text-xs text-neutral-500 mt-1">
                {new Date(p.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">Agregar respuesta</h3>
        <textarea
          className="w-full border rounded p-2"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tu respuesta…"
        />
