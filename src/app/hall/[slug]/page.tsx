// src/app/hall/[slug]/page.tsx
import { getPublicUrl } from "@/utils/supabase/publicUrl";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";
import HallCommentForm from "@/components/HallCommentForm";

export const dynamic = "force-dynamic";

export default async function HallDetail({ params }: { params: { slug: string } }) {
  const supa = createSupabaseServerClientReadOnly();

  const { data: item } = await supa
    .from("hall_items")
    .select("*")
    .eq("slug", params.slug)
    .single();
  if (!item) return <p className="p-6">No encontrado</p>;

  const [{ data: media }, { data: comments }, { data: { user } }] = await Promise.all([
    supa.from("hall_media").select("*").eq("hall_id", item.id).order("created_at", { ascending: false }),
    supa.from("hall_comments").select("*").eq("hall_id", item.id).order("created_at", { ascending: false }),
    supa.auth.getUser(),
  ]);

  return (
    <main className="container py-6 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{item.title}</h1>
        {item.description && <p className="opacity-80 mt-2">{item.description}</p>}
      </header>

      {/* Media */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {media?.length ? (
          media.map((m: any) => {
            const raw = String(m.storage_path || "");
            const url = getPublicUrl(raw);
            const isYouTube = /^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(raw);
            const ytId = isYouTube
              ? raw.match(/[?&]v=([^&]+)/)?.[1]
                || raw.match(/youtu\.be\/([^?&/]+)/)?.[1]
                || raw.match(/\/embed\/([^?&/]+)/)?.[1]
                || raw.match(/\/shorts\/([^?&/]+)/)?.[1]
                || ""
              : "";

            return (
              <div key={m.id} className="border rounded-lg overflow-hidden">
                {m.media_type === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="w-full h-auto" />
                )}
                {m.media_type === "video" && isYouTube && ytId && (
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
                {m.media_type === "video" && (!isYouTube || !ytId) && (
                  <video src={url} controls className="w-full h-auto" />
                )}
              </div>
            );
          })
        ) : (
          <p className="opacity-70">Sin media aún.</p>
        )}
      </section>

      {/* Comentarios */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Comentarios</h2>

        {user ? (
          <HallCommentForm slug={params.slug} />
        ) : (
          <a href="/login" className="underline">Inicia sesión para comentar</a>
        )}

        <ul className="space-y-3">
          {comments?.length ? (
            comments.map((c: any) => (
              <li key={c.id} className="border rounded p-3">
                <div className="text-xs muted-date">
                  {new Date(c.created_at).toLocaleString()}
                </div>
                <div>{c.content}</div>
              </li>
            ))
          ) : (
            <p className="opacity-70">Sé el primero en comentar.</p>
          )}
        </ul>
      </section>
    </main>
  );
}
