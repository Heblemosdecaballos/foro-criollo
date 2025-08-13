'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Thread = {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
  author_id: string | null;
  author_username: string | null;
};

type Post = {
  id: string;
  thread_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  author_id: string | null;
  author_username: string | null;
};

export default function ThreadPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const threadId = params?.id;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  // Cargar hilo + posts desde las vistas
  useEffect(() => {
    if (!threadId) return;

    const load = async () => {
      setLoading(true);
      setMsg(null);

      // hilo
      const { data: th, error: thErr } = await supabase
        .from('v_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (thErr) {
        setMsg(thErr.message);
        setLoading(false);
        return;
      }
      setThread(th);

      // posts
      const { data: ps, error: psErr } = await supabase
        .from('v_posts')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (psErr) {
        setMsg(psErr.message);
      } else {
        setPosts(ps ?? []);
      }
      setLoading(false);
    };

    load();
  }, [threadId]);

  async function handlePublish() {
    try {
      setSending(true);
      setMsg(null);

      const text = reply.trim();
      if (!text) {
        setMsg('Escribe tu respuesta.');
        return;
      }

      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      if (!user) {
        setMsg('Debes iniciar sesión.');
        return;
      }

      // Inserta en posts (tabla real), usando author_id + content
      const { error: insErr } = await supabase.from('posts').insert({
        thread_id: threadId,
        author_id: user.id,
        parent_id: null,    // o el id del post al que respondes si implementas hilos anidados
        content: text,
      });

      if (insErr) throw insErr;

      setReply('');
      // recarga las respuestas
      const { data: ps } = await supabase
        .from('v_posts')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      setPosts(ps ?? []);
    } catch (e: any) {
      setMsg(e.message ?? 'Error al publicar');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Link href="/" className="underline mb-3 inline-block">Volver</Link>

      {loading && <p>Cargando tema…</p>}
      {msg && <p className="text-red-600 mb-3">{msg}</p>}

      {thread && (
        <header className="mb-6">
          <div className="text-sm text-neutral-500 mb-1">
            @{thread.author_username ?? 'usuario'} · {new Date(thread.created_at).toLocaleString()} ·{' '}
            <span className="inline-block px-2 py-0.5 rounded bg-neutral-100">
              {thread.category ?? 'General'}
            </span>
          </div>
          <h1 className="text-2xl font-semibold">{thread.title}</h1>
        </header>
      )}

      <section className="space-y-4 mb-10">
        {posts.map((p) => (
          <article key={p.id} className="border rounded p-3">
            <div className="text-sm text-neutral-500 mb-1">
              @{p.author_username ?? 'usuario'} · {new Date(p.created_at).toLocaleString()}
            </div>
            <p className="whitespace-pre-wrap">{p.content}</p>
          </article>
        ))}
        {posts.length === 0 && !loading && <p>Aún no hay respuestas.</p>}
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Agregar respuesta</h2>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="w-full min-h-[120px] p-3 border rounded"
          placeholder="Escribe tu respuesta…"
        />
        <div className="flex gap-2">
          <button
            onClick={handlePublish}
            disabled={sending}
            className="px-3 py-2 rounded border"
          >
            {sending ? 'Publicando…' : 'Publicar respuesta'}
          </button>
        </div>
      </section>
    </main>
  );
}
