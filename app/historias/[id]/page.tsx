import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import LikeButton from "../../../components/stories/LikeButton";
import Comments from "../../../components/stories/Comments";

function mapRow(row: any) {
  return {
    id: String(row.id),
    title: row.title ?? row.titulo ?? "Historia",
    text: row.text ?? row.contenido ?? "",
    media: row.media ?? row.medios ?? [],
    created_at: row.created_at ?? row.fecha ?? null,
  };
}

async function getCounts(supa: any, storyId: string) {
  const likeHead = await supa
    .from("story_likes")
    .select("*", { count: "exact", head: true })
    .eq("story_id", storyId);
  const likeCount = likeHead.count ?? 0;

  const commentHead = await supa
    .from("story_comments")
    .select("*", { count: "exact", head: true })
    .eq("story_id", storyId)
    .eq("is_deleted", false);
  const commentCount = commentHead.count ?? 0;

  return { likeCount, commentCount };
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const c = cookies();
  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => c.get(n)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  let { data } = await supa
    .from("stories")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    const r2 = await supa
      .from("historias")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();
    data = r2.data as any;
  }

  const story = mapRow(data ?? {});
  const media: any[] = Array.isArray(story.media) ? story.media : [];
  const { likeCount, commentCount } = await getCounts(supa, story.id);

  return (
    <main className="container-page py-8 space-y-6">
      <h1>{story.title}</h1>

      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-2">
        <LikeButton storyId={story.id} initialCount={likeCount} />
        <div className="btn-outline text-sm">💬 {commentCount} comentarios</div>
      </div>

      {/* Galería simple */}
      {media.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {media.map((m: any, i: number) => {
            const url = typeof m === "string" ? m : m?.url || m?.src;
            const kind = typeof m === "string" ? "" : m?.kind || m?.type || "";
            if (!url) return null;
            const isVideo = /(\.mp4|\.mov|\.webm)$/i.test(url) || /video/i.test(kind);
            return (
              <div key={i} className="card overflow-hidden">
                {isVideo ? (
                  <video controls className="w-full">
                    <source src={url} />
                  </video>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={`media-${i}`} className="w-full object-cover" />
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {story.text ? (
        <article className="prose dark:prose-invert max-w-none">
          <p style={{ whiteSpace: "pre-wrap" }}>{story.text}</p>
        </article>
      ) : null}

      {/* Comentarios */}
      <Comments storyId={story.id} />
    </main>
  );
}
