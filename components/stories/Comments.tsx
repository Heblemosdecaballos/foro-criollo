"use client";
import { useEffect, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type Comment = {
  id: string;
  story_id: string;
  author_id: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
  author?: { name?: string | null; avatar_url?: string | null } | null;
};

function supa() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function Comments({ storyId }: { storyId: string }) {
  const sb = supa();
  const [list, setList] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    const { data } = await sb
      .from("story_comments")
      .select("*")
      .eq("story_id", storyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    setList((data ?? []) as any);
  }

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      setUserId(user?.id ?? null);
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      const redirect = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth?redirect=${redirect}`;
      return;
    }
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await sb
        .from("story_comments")
        .insert({ story_id: storyId, author_id: user.id, content: text.trim() })
        .select()
        .single();
      if (!error && data) {
        setList((l) => [data as any, ...l]);
        setText("");
        formRef.current?.reset();
      }
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    // soft delete (is_deleted = true)
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    // only own comment according to policy
    const { error } = await sb
      .from("story_comments")
      .update({ is_deleted: true, content: "[comentario eliminado]" })
      .eq("id", id)
      .eq("author_id", user.id);
    if (!error) setList((l) => l.filter((c) => c.id !== id));
  }

  return (
    <section className="space-y-4">
      <h3>Comentarios</h3>

      <form ref={formRef} onSubmit={submit} className="card p-4 space-y-3">
        <textarea
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Escribe un comentario…"
          rows={3}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end">
          <button disabled={loading} className="btn-brand">
            {loading ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {list.map((c) => {
          const date = new Date(c.created_at).toLocaleString("es-CO", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <li key={c.id} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm opacity-70">{date}</div>
                {userId === c.author_id ? (
                  <button onClick={() => remove(c.id)} className="btn-outline text-xs">
                    Eliminar
                  </button>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap">{c.content}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
