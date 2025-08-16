// app/historias/[id]/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supa() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get(n: string) { return cookieStore.get(n)?.value; },
      set(n: string, v: string, o: any) { try { cookieStore.set({ name: n, value: v, ...o }); } catch {} },
      remove(n: string, o: any) { try { cookieStore.set({ name: n, value: "", ...o }); } catch {} }
    }
  });
}

function MediaViewer({ items }: { items: Array<{ url:string, kind:"image"|"video" }> }) {
  // clientless: simple stack; si quieres slider, lo hacemos luego
  return (
    <div className="space-y-3">
      {items.map((m, i) => (
        <div key={i} className="overflow-hidden rounded border">
          {m.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.url} alt={`media-${i}`} className="w-full object-contain" />
          ) : (
            <video className="w-full" src={m.url} controls />
          )}
        </div>
      ))}
    </div>
  );
}

async function Comments({ storyId }: { storyId: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/stories/${storyId}/comments`, { cache: "no-store" });
  const { items } = await res.json();
  return (
    <div className="space-y-3">
      {(items ?? []).map((c: any) => (
        <div key={c.id} className="rounded border p-2">
          <div className="text-xs text-neutral-500">{new Date(c.created_at).toLocaleString()}</div>
          <div className="whitespace-pre-wrap">{c.body}</div>
        </div>
      ))}
      {(items?.length ?? 0) === 0 && (
        <div className="rounded border border-dashed p-4 text-center text-neutral-500">Sé el primero en comentar</div>
      )}
    </div>
  );
}

export default async function StoryDetail({ params }: { params: { id: string } }) {
  const supabase = supa();
  const { data: story } = await supabase
    .from("stories")
    .select("id,title,body,created_at,like_count,comment_count,story_media(url,kind)")
    .eq("id", params.id)
    .single();

  if (!story) {
    return <main className="mx-auto max-w-4xl p-4">Historia no encontrada.</main>;
  }

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{story.title ?? "Historia"}</h1>
        <p className="text-xs text-neutral-500">Publicado el {new Date(story.created_at).toLocaleString()}</p>
      </header>

      {Array.isArray(story.story_media) && story.story_media.length > 0 && (
        <MediaViewer items={story.story_media} />
      )}

      {story.body && (
        <article className="whitespace-pre-wrap rounded border p-3">{story.body}</article>
      )}

      <section>
        <h2 className="mb-2 text-lg font-medium">Comentarios</h2>
        {/* Formulario cliente embebido para comentar */}
        {/* ComentarForm */}
        {/* Lo dejamos súper simple */}
        <CommentForm storyId={story.id} />
        <div className="mt-4">
          {/* Lista */}
          {/* @ts-expect-error Server Component */}
          <Comments storyId={story.id} />
        </div>
      </section>
    </main>
  );
}

// ----- Client component dentro del mismo archivo -----
"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

function supaClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}
function CommentForm({ storyId }: { storyId: string }) {
  const supabase = supaClient();
  const [user, setUser] = useState<any>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  async function submit() {
    if (!user || !text.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/stories/${storyId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text })
    });
    setSubmitting(false);
    if (!res.ok) { alert("Error al comentar"); return; }
    setText("");
    location.reload();
  }

  return (
    <div className="space-y-2">
      {!user && (
        <div className="rounded border border-amber-300 bg-amber-50 p-2 text-amber-900 text-sm">
          Inicia sesión para comentar.
        </div>
      )}
      <textarea
        className="w-full rounded border p-2 min-h-24 disabled:opacity-60"
        placeholder={user ? "Escribe tu comentario…" : "Inicia sesión para comentar"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!user || submitting}
      />
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={!user || submitting || !text.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Enviando…" : "Comentar"}
        </button>
      </div>
    </div>
  );
}
