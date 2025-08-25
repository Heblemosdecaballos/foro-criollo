// src/app/hall/[slug]/page.tsx
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";
import AddMediaForm from "./AddMediaForm";
import HallCommentForm from "./HallCommentForm";

export const dynamic = "force-dynamic";

type Media = {
  id: string;
  media_type: "image" | "video" | "youtube";
  storage_path: string | null;
  media_url: string | null;
  created_at: string;
};

type Comment = {
  id: string;
  body: string;
  author_id: string;
  created_at: string;
};

function youtubeEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    const v = u.searchParams.get("v");
    return v ? `https://www.youtube.com/embed/${v}` : url;
  } catch {
    return url;
  }
}

export default async function HallSlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params; // ← aquí obtenemos el slug de la URL

  const supa = createSupabaseServerClientReadOnly();

  const { data: hall } = await supa
    .from("halls")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  const { data: media = [] } = (await supa
    .from("hall_media")
    .select("*")
    .eq("hall_slug", slug)
    .order("created_at", { ascending: false })) as unknown as { data: Media[] };

  const { data: comments = [] } = (await supa
    .from("hall_comments")
    .select("*")
    .eq("hall_slug", slug)
    .order("created_at", { ascending: false })) as unknown as { data: Comment[] };

  const { data: { user } } = await supa.auth.getUser();

  return (
    <main className="container py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{hall?.title || `Hall: ${slug}`}</h1>
        {hall?.description && <p className="opacity-80">{hall.description}</p>}
      </header>

      {/* ← AQUÍ “pasamos el slug” al componente como prop */}
      {user ? (
        <section className="space-y-3">
          <h2 className="text-xl font-medium">Agregar contenido</h2>
          <AddMediaForm slug={slug} />
        </section>
      ) : (
        <p className="opacity-70">Inicia sesión para subir fotos o videos al Hall.</p>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Galería</h2>
        {media.length === 0 && <p className="opacity-70">Aún no hay contenido en este andar.</p>}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((m) => {
            const url = m.storage_path || m.media_url || "";
            if (m.media_type === "youtube" && url) {
              return (
                <li key={m.id} className="bg-white/70 rounded border p-2">
                  <div className="aspect-video">
                    <iframe
                      src={youtubeEmbed(url)}
                      className="w-full h-full rounded"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="YouTube"
                    />
                  </div>
                </li>
              );
            }
            if (m.media_type === "video" && url) {
              return (
                <li key={m.id} className="bg-white/70 rounded border p-2">
                  <video controls className="w-full rounded">
                    <source src={url} />
                  </video>
                </li>
              );
            }
            return (
              <li key={m.id} className="bg-white/70 rounded border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full rounded" />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Comentarios</h2>
        {user ? (
          // También pasamos el slug al form de comentarios
          <HallCommentForm slug={slug} />
        ) : (
          <p className="opacity-70">Inicia sesión para escribir comentarios.</p>
        )}

        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="bg-white/70 rounded border p-3">
              <div className="text-sm opacity-70">
                {new Date(c.created_at).toLocaleString()}
              </div>
              <div>{c.body}</div>
            </li>
          ))}
          {comments.length === 0 && <p className="opacity-70">Aún no hay comentarios.</p>}
        </ul>
      </section>
    </main>
  );
}
