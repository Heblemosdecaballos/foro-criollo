'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Author = { username: string | null; avatar_url: string | null } | null;

type ThreadRow = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  created_by: string;
  profiles?: Author; // join autor thread
};

type PostRow = {
  id: string;
  thread_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  created_by: string;
  profiles?: Author; // join autor post
};

// Para anidar comentarios
type PostNode = PostRow & { children: PostNode[] };

function buildTree(rows: PostRow[]): PostNode[] {
  const nodes = new Map<string, PostNode>();
  const roots: PostNode[] = [];
  rows.forEach((r) => nodes.set(r.id, { ...r, children: [] }));
  rows.forEach((r) => {
    const node = nodes.get(r.id)!;
    if (r.parent_id && nodes.has(r.parent_id)) {
      nodes.get(r.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export default function ThreadPage({ params }: { params: { id: string } }) {
  const threadId = params.id;
  const [thread, setThread] = useState<ThreadRow | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // form para responder al hilo (post raíz)
  const [newReply, setNewReply] = useState('');
  const [sending, setSending] = useState(false);

  const tree = useMemo(() => buildTree(posts), [posts]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);
      try {
        // 1) traer tema + autor
        const { data: t, error: tErr } = await supabase
          .from('threads')
          .select(
            'id, title, category, created_at, created_by, profiles:created_by ( username, avatar_url )'
          )
          .eq('id', threadId)
          .maybeSingle();
        if (tErr) throw tErr;
        if (!t) throw new Error('Tema no encontrado');
        setThread(t as any);

        // 2) posts con autor
        const { data: ps, error: pErr } = await supabase
          .from('posts')
          .select(
            'id, thread_id, parent_id, content, created_at, created_by, profiles:created_by ( username, avatar_url )'
          )
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });

        if (pErr) throw pErr;
        setPosts((ps as any) ?? []);
      } catch (e: any) {
        setMsg(e.message ?? 'No se pudo cargar el tema');
      } finally {
        setLoading(false);
      }
    })();
  }, [threadId]);

  async function publishReply(parentId: string | null, content: string) {
    try {
      const { data: s } = await supabase.auth.getUser();
      const user = s.user;
      if (!user) throw new Error('Debes iniciar sesión');

      const payload = {
        thread_id: threadId,
        parent_id: parentId,
        content,
        created_by: user.id,
      };

      const { error } = await supabase.from('posts').insert(payload);
      if (error) throw error;

      // recargar posts
      const { data: ps, error: pErr } = await supabase
        .from('posts')
        .select(
          'id, thread_id, parent_id, content, created_at, created_by, profiles:created_by ( username, avatar_url )'
        )
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
      if (pErr) throw pErr;
      setPosts((ps as any) ?? []);
    } catch (e: any) {
      setMsg(e.message ?? 'No se pudo publicar la respuesta');
    }
  }

  async function handlePublishRoot() {
    if (!newReply.trim()) return;
    setSending(true);
    await publishReply(null, newReply.trim());
    setNewReply('');
    setSending(false);
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <p>Cargando…</p>
      </main>
    );
  }

  if (!thread) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <p>Tema no encontrado.</p>
        <Link href="/" className="underline">
          Volver
        </Link>
      </main>
    );
  }

  const author = thread.profiles?.username ?? 'usuario';
  const avatar = thread.profiles?.avatar_url ?? '';

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/" className="underline">
          Volver
        </Link>
      </div>

      {msg && <p className="text-red-600 mb-4">{msg}</p>}

      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{thread.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-neutral-600">
          {avatar ? (
            <img
              src={avatar}
              alt={author}
              className="h-6 w-6 rounded-full object-cover border"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-neutral-200" />
          )}
          <span>@{author}</span>
          <span>•</span>
          <span>{new Date(thread.created_at).toLocaleString()}</span>
          <span>•</span>
          <span className="px-2 py-0.5 text-xs rounded-full border">
            {thread.category}
          </span>
        </div>
      </header>

      {/* responder al hilo (post raíz) */}
      <section className="mb-8">
        <label className="block text-sm font-medium mb-1">Agregar respuesta</label>
        <textarea
          className="w-full rounded border p-2"
          rows={4}
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Escribe tu respuesta…"
        />
        <div className="mt-2">
          <button
            onClick={handlePublishRoot}
            disabled={sending || !newReply.trim()}
            className="rounded bg-black text-white px-3 py-1 disabled:opacity-50"
          >
            {sending ? 'Publicando…' : 'Publicar respuesta'}
          </button>
        </div>
      </section>

      {/* listado de posts con árbol de comentarios */}
      <section className="space-y-6">
        {tree.map((n) => (
          <PostItem key={n.id} node={n} onReply={publishReply} level={0} />
        ))}
      </section>
    </main>
  );
}

function PostItem({
  node,
  onReply,
  level,
}: {
  node: PostNode;
  onReply: (parentId: string | null, content: string) => Promise<void>;
  level: number;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const author = node.profiles?.username ?? 'usuario';
  const avatar = node.profiles?.avatar_url ?? '';

  async function handleReply() {
    if (!content.trim()) return;
    setSending(true);
    await onReply(node.id, content.trim());
    setContent('');
    setOpen(false);
    setSending(false);
  }

  return (
    <article
      className="rounded border p-3"
      style={{ marginLeft: level * 16 }}
    >
      <div className="flex items-center gap-3 text-sm text-neutral-600">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="h-5 w-5 rounded-full object-cover border"
          />
        ) : (
          <div className="h-5 w-5 rounded-full bg-neutral-200" />
        )}
        <span>@{author}</span>
        <span>•</span>
        <span>{new Date(node.created_at).toLocaleString()}</span>
      </div>

      <p className="mt-2 whitespace-pre-wrap">{node.content}</p>

      <div className="mt-2">
        <button
          className="text-sm underline underline-offset-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Cancelar' : 'Responder'}
        </button>
      </div>

      {open && (
        <div className="mt-2">
          <textarea
            className="w-full rounded border p-2"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tu respuesta…"
          />
          <div className="mt-2">
            <button
              onClick={handleReply}
              disabled={sending || !content.trim()}
              className="rounded bg-black text-white px-3 py-1 disabled:opacity-50"
            >
              {sending ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
        </div>
      )}

      {node.children.length > 0 && (
        <div className="mt-3 space-y-4">
          {node.children.map((c) => (
            <PostItem
              key={c.id}
              node={c}
              onReply={onReply}
              level={Math.min(level + 1, 6)}
            />
          ))}
        </div>
      )}
    </article>
  );
}
