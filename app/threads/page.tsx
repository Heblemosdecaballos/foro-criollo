'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PostRow = {
  id: string;
  author_id: string | null;
  created_at: string;
  // cualquiera de estas podría existir según tu esquema:
  body?: string | null;
  content?: string | null;
  text?: string | null;
  message?: string | null;
};

type Thread = {
  id: string;
  title: string;
  created_at: string;
  author_id: string | null;
};

function pickText(p: PostRow): string {
  return (
    (p.body ?? '') ||
    (p.content ?? '') ||
    (p.text ?? '') ||
    (p.message ?? '') ||
    ''
  );
}

export default function ThreadDetailPage() {
  const params = useParams<{ id: string }>();
  const threadId = params?.id;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!threadId) return;
      setLoading(true);
      setErr(null);
      try {
        // 1) Hilo
        const { data: th, error: e1 } = await supabase
          .from('threads')
          .select('id,title,created_at,author_id')
          .eq('id', threadId)
          .limit(1)
          .maybeSingle();

        if (e1) throw e1;
        if (!th) {
          setErr('No se encontró el hilo.');
          setLoading(false);
          return;
        }
        setThread(th as Thread);

        // 2) Posts del hilo (traemos posibles columnas de texto)
        const { data: ps, error: e2 } = await supabase
          .from('posts')
          .select('id,author_id,created_at,body,content,text,message')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });

        if (e2) throw e2;

        setPosts((ps ?? []) as PostRow[]);
      } catch (e: any) {
        setErr(e?.message || 'Error cargando el hilo.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [threadId]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <a href="/threads" className="text-sm underline" style={{ color: 'var(--brand-primary)' }}>
        ← Volver a hilos
      </a>

      {loading ? (
        <div className="p-4 rounded-xl border" style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)' }}>
          Cargando…
        </div>
      ) : err ? (
        <div className="p-4 rounded-xl border" style={{ background:'#FDECEC', borderColor:'#F5B3B1', color:'#C63934' }}>
          {err}
        </div>
      ) : thread ? (
        <>
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold font-cinzel">{thread.title}</h1>
            <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
              Hilo creado el {new Date(thread.created_at).toLocaleString()}
            </p>
          </header>

          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id}
                  className="p-4 rounded-xl border"
                  style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)', boxShadow:'var(--brand-shadow)' }}>
                <div className="text-sm mb-1" style={{ color: 'var(--brand-muted)' }}>
                  @{p.author_id?.slice(0,8) ?? 'usuario'} • {new Date(p.created_at).toLocaleString()}
                </div>
                <div className="whitespace-pre-wrap">
                  {pickText(p) || <span className="text-sm" style={{ color:'var(--brand-muted)' }}>(sin contenido)</span>}
                </div>
              </li>
            ))}
            {posts.length === 0 && (
              <li className="p-4 rounded-xl border"
                  style={{ background:'var(--brand-surface)', borderColor:'var(--brand-border)' }}>
                <span style={{ color:'var(--brand-muted)' }}>Aún no hay respuestas en este hilo.</span>
              </li>
            )}
          </ul>
        </>
      ) : null}
    </main>
  );
}
