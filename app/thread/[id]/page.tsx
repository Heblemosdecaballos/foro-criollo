'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import ReportButton from '@/components/ReportButton';

type Thread = {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
  created_by: string;
};

type Post = {
  id: string;
  thread_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
};

type Profile = {
  user_id: string;
  username: string | null;
};

type PostNode = Post & { children: PostNode[] };

export default function ThreadPage() {
  const params = useParams<{ id: string }>();
  const threadId = params.id;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [byUser, setByUser] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [rootContent, setRootContent] = useState('');
  const canSendRoot = useMemo(() => rootContent.trim().length > 0, [rootContent]);

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        setErr(null);

        const { data: u, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        setUserId(u.user?.id ?? null);

        const { data: th, error: tErr } = await supabase
          .from('threads')
          .select('id, title, category, created_at, created_by')
          .eq('id', threadId)
          .maybeSingle();
        if (tErr) throw tErr;
        if (!th) { setErr('Tema no encontrado'); return; }
        setThread(th);

        const { data: ps, error: pErr } = await supabase
          .from('posts')
          .select('id, thread_id, author_id, parent_id, content, created_at')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });
        if (pErr) throw pErr;
        setPosts(ps ?? []);

        const ids = Array.from(new Set([th.created_by, ...(ps ?? []).map(p => p.author_id)]));
        if (ids.length) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('user_id, username')
            .in('user_id', ids);
          const map: Record<string, string> = {};
          (profs ?? []).forEach((p: Profile) => (map[p.user_id] = p.username ?? 'usuario'));
          setByUser(map);
        } else {
          setByUser({});
        }
      } catch (e: any) {
        setErr(e.message ?? 'Error cargando el tema');
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`posts:${threadId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts', filter: `thread_id=eq.${threadId}` },
        async () => { await refetchPosts(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [threadId]);

  async function refetchPosts() {
    const { data: ps } = await supabase
      .from('posts')
      .select('id, thread_id, author_id, parent_id, content, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    setPosts(ps ?? []);
  }

  const tree: PostNode[] = useMemo(() => {
    const byId: Record<string, PostNode> = {};
    posts.forEach(p => (byId[p.id] = { ...p, children: [] }));
    const roots: PostNode[] = [];
    posts.forEach(p => {
      if (p.parent_id && byId[p.parent_id]) byId[p.parent_id].children.push(byId[p.id]);
      else roots.push(byId[p.id]);
    });
    return roots;
  }, [posts]);

  async function sendRoot() {
    try {
      const text = rootContent.trim();
      if (!text) return;
      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      if (!user) throw new Error('Debes iniciar sesión');

      const { error } = await supabase.from('posts').insert({
        thread_id: threadId,
        author_id: user.id,
        parent_id: null,
        content: text,
      });
      if (error) throw error;
      setRootContent('');
    } catch (e: any) {
      alert(e.message ?? 'No se pudo publicar');
    }
  }

  if (loading) return <div className="p-6">Cargando tema…</div>;
  if (err) return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/" className="underline">Volver</Link>
      <div className="mt-4 text-red-600">{err}</div>
    </div>
  );
  if (!thread) return null;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href="/" className="underline">Volver</Link>

      <header>
        <h1 className="text-2xl font-semibold">{thread.title}</h1>
        <div className="text-sm text-neutral-500 flex items-center gap-2">
          <span>@{byUser[thread.created_by] ?? 'usuario'}</span>
          <span>·</span>
          <span>{new Date(thread.created_at).toLocaleString()}</span>
          {thread.category && (
            <>
              <span>·</span>
              <span className="px-2 py-0.5 rounded bg-neutral-100">{thread.category}</span>
            </>
          )}
        </div>
      </header>

      <section className="space-y-3">
        {tree.length === 0 ? (
          <p className="text-neutral-500">No hay respuestas aún.</p>
        ) : (
          tree.map(n => (
            <PostItem
              key={n.id}
              node={n}
              byUser={byUser}
              userId={userId}
              depth={0}
            />
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Agregar respuesta</h2>
        <textarea
          className="w-full border rounded p-2 min-h-[120px]"
          value={rootContent}
          onChange={(e) => setRootContent(e.target.value)}
          placeholder="Escribe tu respuesta…"
        />
        <button
          onClick={sendRoot}
          disabled={!canSendRoot}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          Publicar respuesta
        </button>
      </section>
    </main>
  );
}

function PostItem({
  node,
  byUser,
  userId,
  depth,
}: {
  node: PostNode;
  byUser: Record<string, string>;
  userId: string | null;
  depth: number;
}) {
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(node.content);
  const pad = Math.min(depth * 20, 60);

  const canReply = !!userId;
  const isOwner = userId === node.author_id;

  async function sendReply() {
    try {
      const text = reply.trim();
      if (!text) return;
      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      if (!user) throw new Error('Debes iniciar sesión');

      const { error } = await supabase.from('posts').insert({
        thread_id: node.thread_id,
        author_id: user.id,
        parent_id: node.id,
        content: text,
      });
      if (error) throw error;

      setReply('');
      setReplying(false);
    } catch (e: any) {
      alert(e.message ?? 'No se pudo responder');
    }
  }

  async function saveEdit() {
    try {
      const text = editText.trim();
      if (!text) return;
      const { error } = await supabase
        .from('posts')
        .update({ content: text })
        .eq('id', node.id);
      if (error) throw error;
      setEditing(false);
    } catch (e: any) {
      alert(e.message ?? 'No se pudo editar');
    }
  }

  async function removePost() {
    if (!confirm('¿Borrar esta respuesta?')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', node.id);
      if (error) throw error;
    } catch (e: any) {
      alert(e.message ?? 'No se pudo borrar');
    }
  }

  return (
    <div className="border rounded p-3" style={{ marginLeft: pad }}>
      <div className="text-sm text-neutral-500 flex items-center gap-2">
        <span>@{byUser[node.author_id] ?? 'usuario'}</span>
        <span>·</span>
        <span>{new Date(node.created_at).toLocaleString()}</span>
      </div>

      {!editing ? (
        <p className="mt-2 whitespace-pre-wrap">{node.content}</p>
      ) : (
        <div className="mt-2 space-y-2">
          <textarea
            className="w-full border rounded p-2 min-h-[100px]"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border" onClick={saveEdit}>
              Guardar
            </button>
            <button className="px-3 py-1 rounded border" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mt-2 flex gap-3 text-sm">
        {canReply && (
          <button className="underline" onClick={() => setReplying(v => !v)}>
            {replying ? 'Cancelar' : 'Responder'}
          </button>
        )}

        {isOwner ? (
          <>
            <button className="underline" onClick={() => setEditing(v => !v)}>
              {editing ? 'Cancelar' : 'Editar'}
            </button>
            <button className="underline text-red-600" onClick={removePost}>
              Borrar
            </button>
          </>
        ) : (
          userId && <ReportButton postId={node.id} />
        )}
      </div>

      {replying && (
        <div className="mt-2 space-y-2">
          <textarea
            className="w-full border rounded p-2 min-h-[100px]"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Escribe tu respuesta a esta respuesta…"
          />
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={sendReply}
            disabled={!reply.trim()}
          >
            Publicar
          </button>
        </div>
      )}

      {node.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {node.children.map(child => (
            <PostItem
              key={child.id}
              node={child}
              byUser={byUser}
              userId={userId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
