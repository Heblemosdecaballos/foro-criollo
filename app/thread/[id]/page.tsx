import { supabase } from '@/lib/supabaseClient'
;

import { useEffect, useMemo, useState } from 'react';
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
  parent_id: string | null;
};

type PostNode = Post & { children: PostNode[] };

export default function ThreadPage({ params }: { params: { id: string } }) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  // Cargar usuario
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Cargar tema + posts
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
          .select('id, body, created_at, created_by, parent_id')
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

  // Construir árbol (roots = posts sin parent_id)
  const tree = useMemo<PostNode[]>(() => {
    const map = new Map<string, PostNode>();
    const roots: PostNode[] = [];

    posts.forEach((p) => map.set(p.id, { ...p, children: [] }));

    posts.forEach((p) => {
      const node = map.get(p.id)!;
      if (p.parent_id) {
        const parent = map.get(p.parent_id);
        if (parent) parent.children.push(node);
        else roots.push(node); // por si acaso (parent borrado)
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [posts]);

  // Publicar respuesta (root o a un post)
  async function publishReply(text: string, parentId: string | null) {
    if (!userId) throw new Error('Necesitas iniciar sesión');

    const body = text.trim();
    if (!body) throw new Error('Escribe un comentario');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        thread_id: params.id,
        body,
        created_by: userId,
        parent_id: parentId
      })
      .select('id, body, created_at, created_by, parent_id')
      .single();

    if (error) throw error;

    // Insertar en memoria sin recargar
    setPosts((prev) => [...prev, data as Post]);
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

            {/* Respuestas raíz */}
            <ul className="space-y-3">
              {tree.map((node) => (
                <PostItem
                  key={node.id}
                  node={node}
                  level={0}
                  canReply={!!userId}
                  onReply={(text) => publishReply(text, node.id)}
                />
              ))}
            </ul>
          </section>

          {/* Responder al hilo (root) */}
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
              <ReplyForm onSubmit={(text) => publishReply(text, null)} />
            )}
          </section>
        </>
      )}
    </main>
  );
}

/* ---------- Componentes auxiliares ---------- */

function PostItem({
  node,
  level,
  canReply,
  onReply
}: {
  node: PostNode;
  level: number;
  canReply: boolean;
  onReply: (text: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const margin = Math.min(level, 6) * 16; // limita indentación

  return (
    <li className="rounded border p-3" style={{ marginLeft: margin }}>
      <p className="whitespace-pre-wrap">{node.body}</p>
      <div className="text-xs text-neutral-500 mt-2">
        {new Date(node.created_at).toLocaleString()}
      </div>

      <div className="mt-2">
        {canReply ? (
          <>
            {!open ? (
              <button
                onClick={() => setOpen(true)}
                className="text-sm underline"
              >
                Responder
              </button>
            ) : (
              <div className="mt-2">
                <ReplyForm
                  onSubmit={async (text) => {
                    await onReply(text);
                    setOpen(false);
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <span className="text-sm text-neutral-500">
            Debes iniciar sesión para responder
          </span>
        )}
      </div>

      {node.children.length > 0 && (
        <ul className="mt-3 space-y-3">
          {node.children.map((child) => (
            <PostItem
              key={child.id}
              node={child}
              level={level + 1}
              canReply={canReply}
              onReply={onReplyWrapper(onReply, child.id)}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function onReplyWrapper(
  onReply: (text: string, parentId?: string | null) => Promise<void>,
  parentId: string
) {
  return (text: string) => onReply(text); // el parentId ya lo maneja quien llama
}

function ReplyForm({ onSubmit }: { onSubmit: (text: string) => Promise<void> }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg(null);
        const t = text.trim();
        if (!t) return setMsg('Escribe un comentario');

        try {
          setSending(true);
          await onSubmit(t);
          setText('');
        } catch (error: any) {
          setMsg(error.message || 'Error al publicar');
        } finally {
          setSending(false);
        }
      }}
      className="space-y-2"
    >
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <textarea
        className="w-full border rounded p-2 min-h-[100px]"
        placeholder="Escribe tu respuesta…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="px-3 py-2 rounded border font-medium"
        type="submit"
        disabled={sending}
      >
        {sending ? 'Enviando…' : 'Publicar respuesta'}
      </button>
    </form>
  );
}
