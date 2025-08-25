// src/app/hall/[slug]/page.tsx
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";
import { addMediaAction, addHallComment } from "./actions";

export const dynamic = "force-dynamic";

type Media = {
  id: string;
  media_type: "image" | "video" | "youtube";
  storage_path: string | null; // URL pública si subimos archivo
  media_url: string | null;    // URL externa (YouTube)
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
    // https://youtu.be/ID  |  https://www.youtube.com/watch?v=ID
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    return url;
  } catch {
    return url;
  }
}

export default async function HallSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const supa = createSupabaseServerClientReadOnly();

  // Datos del hall (si existe tabla halls)
  const { data: hall } = await supa
    .from("halls")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  // Media
  const { data: media = [] } = await supa
    .from("hall_media")
    .select("*")
    .eq("hall_slug", slug)
    .order("created_at", { ascending: false }) as unknown as { data: Media[] };

  // Comentarios
  const { data: comments = [] } = await supa
    .from("hall_comments")
    .select("*")
    .eq("hall_slug", slug)
    .order("created_at", { ascending: false }) as unknown as {
    data: Comment[];
  };

  // Usuario
  const {
    data: { user },
  } = await supa.auth.getUser();

  return (
    <main className="container py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {hall?.title || `Hall: ${slug}`}
        </h1>
        {hall?.description && (
          <p className="opacity-80">{hall.description}</p>
        )}
      </header>

      {/* Subida de media */}
      {user ? (
        <section className="space-y-3">
          <h2 className="text-xl font-medium">Agregar contenido</h2>
          <form
            action={(fd) => addMediaAction(slug, fd)}
            className="space-y-2 bg-white/70 p-3 rounded border"
          >
            <div className="flex gap-3 text-sm">
              <label>
                <input type="radio" name="type" value="image" defaultChecked />{" "}
                Imagen
              </label>
              <label>
                <input type="radio" name="type" value="video" /> Video (archivo)
              </label>
              <label>
                <input type="radio" name="type" value="youtube" /> YouTube
                (URL)
              </label>
            </div>
            <input
              name="file"
              type="file"
              className="w-full border rounded px-3 py-2"
            />
            <input
              name="youtubeUrl"
              type="url"
              placeholder="https://youtu.be/…"
              className="w-full border rounded px-3 py-2"
            />
            <button className="px-3 py-2 rounded bg-[var(--brand-brown)] text-white">
              Subir al Hall
            </button>
          </form>
        </section>
      ) : (
        <p className="opacity-70">
          Inicia sesión para subir fotos o videos al Hall.
        </p>
      )}

      {/* Galería */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Galería</h2>
        {media.length === 0 && (
          <p className="opacity-70">Aún no hay contenido en este andar.</p>
        )}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((m) => {
            if (m.media_type === "youtube" && m.media_url) {
              return (
                <li key={m.id} className="bg-white/70 rounded border p-2">
                  <div className="aspect-video">
                    <iframe
                      src={youtubeEmbed(m.media_url)}
                      className="w-full h-full rounded"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="YouTube"
                    />
                  </div>
                </li>
              );
            }

            const url = m.storage_path || m.media_url || "";
            if (m.media_type === "video") {
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

      {/* Comentarios */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Comentarios</h2>

        {user ? (
          <form
            action={(fd) => addHallComment(slug, fd)}
            className="space-y-2 bg-white/70 p-3 rounded border"
          >
            <textarea
              name="body"
              rows={4}
              placeholder="Escribe un comentario…"
              className="w-full border rounded px-3 py-2"
            />
            <button className="px-3 py-2 rounded bg-[var(--brand-green)] text-white">
              Comentar
            </button>
          </form>
        ) : (
          <p className="opacity-70">
            Inicia sesión para escribir comentarios en el Hall.
          </p>
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
          {comments.length === 0 && (
            <p className="opacity-70">Aún no hay comentarios.</p>
          )}
        </ul>
      </section>
    </main>
  );
}
