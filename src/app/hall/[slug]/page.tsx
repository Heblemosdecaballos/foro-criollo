// src/app/hall/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import AddMediaForm from "./AddMediaForm";
import HallCommentForm from "./HallCommentForm";
import VoteButton from "./VoteButton";

type Media = {
  id: string;
  media_type: "image" | "video" | "youtube";
  media_url: string | null;
  storage_path: string | null;
  author_id: string | null;
  author_name: string | null;
  created_at: string;
};

type Comment = {
  id: string;
  text: string;
  created_at: string;
  author_id: string | null;
  author_name: string | null;
};

type VoteAgg = {
  media_id: string | null;
  votes: number;
};

export const dynamic = "force-dynamic";

async function getHallData(slug: string) {
  const supa = createSupabaseServerClient();

  const { data: media } = await supa
    .from("hall_media")
    .select(
      "id,media_type,media_url,storage_path,author_id,author_name,created_at"
    )
    .eq("hall_slug", slug)
    .order("created_at", { ascending: false });

  const { data: comments } = await supa
    .from("hall_comments")
    .select("id,text,created_at,author_id,author_name")
    .eq("hall_slug", slug)
    .order("created_at", { ascending: true });

  // votos por media y globales (media_id NULL)
  const { data: votesAgg } = await supa
    .from("hall_votes")
    .select("media_id, hall_slug", { count: "exact", head: false });

  const counts: Record<string, number> = {};
  (votesAgg as any[] | null)?.forEach((v: any) => {
    const key = v.media_id ?? "global";
    counts[key] = (counts[key] || 0) + 1;
  });

  return {
    media: (media as Media[]) || [],
    comments: (comments as Comment[]) || [],
    counts,
  };
}

export default async function HallPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { media, comments, counts } = await getHallData(slug);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/hall" className="text-sm opacity-70 hover:underline">
            ← Volver
          </Link>
          <h1 className="mt-2 text-2xl font-semibold capitalize">{slug.replace(/-/g, " ")}</h1>
        </div>

        <VoteButton slug={slug} initialVotes={counts["global"] ?? 0} />
      </header>

      {/* Subir media */}
      <AddMediaForm slug={slug} />

      {/* Listado de media */}
      <section className="mt-8 space-y-4">
        {media.length === 0 ? (
          <p className="text-sm opacity-70">Aún no hay media. ¡Sé el primero en subir!</p>
        ) : (
          media.map((m) => (
            <article key={m.id} className="rounded-lg bg-white p-4">
              <div className="mb-2 flex items-center justify-between text-xs opacity-70">
                <span>{new Date(m.created_at).toLocaleString()}</span>
                <span>{m.author_name || "Usuario"}</span>
              </div>

              {m.media_type === "image" && m.media_url && (
                <div className="relative h-64 w-full overflow-hidden rounded">
                  <Image
                    src={m.media_url}
                    alt="Imagen del hall"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {m.media_type === "video" && m.media_url && (
                <video controls className="w-full rounded">
                  <source src={m.media_url} />
                </video>
              )}

              {m.media_type === "youtube" && m.media_url && (
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full rounded"
                    src={m.media_url.replace("watch?v=", "embed/")}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube player"
                  />
                </div>
              )}

              <div className="mt-3">
                <VoteButton
                  slug={slug}
                  mediaId={m.id}
                  initialVotes={counts[m.id] ?? 0}
                />
              </div>
            </article>
          ))
        )}
      </section>

      {/* Comentarios */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Comentarios</h2>

        {comments.length === 0 ? (
          <p className="mb-3 text-sm opacity-70">Sé el primero en comentar.</p>
        ) : (
          <ul className="mb-6 space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="rounded-md bg-white p-3">
                <div className="text-sm">{c.text}</div>
                <div className="mt-1 text-xs opacity-60">
                  {new Date(c.created_at).toLocaleString()} ·{" "}
                  {c.author_name || "Usuario"}
                </div>
              </li>
            ))}
          </ul>
        )}

        <HallCommentForm slug={slug} />
      </section>
    </main>
  );
}
