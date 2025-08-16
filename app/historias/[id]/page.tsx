// app/historias/[id]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = supa();
  const { data: story } = await supabase
    .from("stories")
    .select("title,body,story_media(url,kind)")
    .eq("id", params.id)
    .maybeSingle();

  const title = story?.title ? `${story.title} · Hablando de Caballos` : "Historia · Hablando de Caballos";
  const description = story?.body?.slice(0, 150) ?? "Historia en Hablando de Caballos";
  const image = story?.story_media?.[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title, description,
      images: image ? [{ url: image }] : undefined
    }
  };
}


import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CommentForm from "./CommentForm";

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

  const { data: comments } = await supabase
    .from("story_comments")
    .select("id,body,author_id,parent_id,created_at")
    .eq("story_id", story.id)
    .order("created_at", { ascending: true });

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
        {/* Formulario cliente */}
        <CommentForm storyId={story.id} />
        <div className="mt-4 space-y-3">
          {(comments ?? []).map((c) => (
            <div key={c.id} className="rounded border p-2">
              <div className="text-xs text-neutral-500">{new Date(c.created_at).toLocaleString()}</div>
              <div className="whitespace-pre-wrap">{c.body}</div>
            </div>
          ))}
          {(comments?.length ?? 0) === 0 && (
            <div className="rounded border border-dashed p-4 text-center text-neutral-500">
              Sé el primero en comentar
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
