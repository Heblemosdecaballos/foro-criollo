// src/app/hall/[slug]/page.tsx
import { createSupabaseServer } from "@/src/lib/supabase/server";
import AddMediaForm from "@/src/components/hall/AddMediaForm";
import HallCommentForm from "@/src/components/hall/HallCommentForm";
import VoteButton from "@/src/components/hall/VoteButton";
import Link from "next/link";
import Image from "next/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: { slug: string } };

async function getData(slug: string) {
  const supabase = createSupabaseServer();

  const { data: hall } = await supabase.from("halls").select("*").eq("slug", slug).single();

  const { data: horses } = await supabase
    .from("hall_horses")
    .select("id, name, slug")
    .eq("hall_slug", slug)
    .order("name", { ascending: true });

  const { data: media } = await supabase
    .from("hall_media")
    .select("*")
    .eq("hall_slug", slug)
    .order("created_at", { ascending: false });

  const { data: comments } = await supabase
    .from("hall_comments")
    .select("*")
    .eq("hall_slug", slug)
    .order("created_at", { ascending: false })
    .limit(50);

  // conteo de votos por media
  const voteCounts: Record<string, number> = {};
  if (media?.length) {
    await Promise.all(
      media.map(async (m) => {
        const { count } = await supabase
          .from("hall_votes")
          .select("*", { count: "exact", head: true })
          .eq("hall_slug", slug)
          .eq("media_id", m.id);
        voteCounts[m.id] = count ?? 0;
      })
    );
  }

  const { count: hallVotesCount } = await supabase
    .from("hall_votes")
    .select("*", { count: "exact", head: true })
    .eq("hall_slug", slug)
    .is("media_id", null);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    hall,
    horses: horses ?? [],
    media: media ?? [],
    comments: comments ?? [],
    voteCounts,
    hallVotesCount: hallVotesCount ?? 0,
    user,
  };
}

function extractYouTubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v")!;
    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/").pop()!;
    return "";
  } catch {
    return "";
  }
}

export default async function HallPage({ params }: Props) {
  const { slug } = params;
  const { hall, horses, media, comments, voteCounts, hallVotesCount, user } = await getData(slug);

  // agrupar media por horse_id
  const byHorse: Record<string, any[]> = {};
  for (const m of media) {
    const key = m.horse_id || "__none__";
    byHorse[key] = byHorse[key] || [];
    byHorse[key].push(m);
  }

  const horsesWithNone = [
    { id: "__none__", name: "Sin ejemplar" },
    ...horses,
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hall of Fame — {hall?.name ?? slug}</h1>
          <p className="text-sm text-gray-500">Slug: {slug}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Votos globales</div>
          <div className="text-2xl font-semibold">{hallVotesCount}</div>
          {user ? (
            <div className="mt-2">
              <VoteButton hallSlug={slug} />
            </div>
          ) : (
            <p className="text-xs text-gray-500">Inicia sesión para votar</p>
          )}
        </div>
      </header>

      <section className="rounded-2xl border p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4">Sube tu media</h2>
        {user ? (
          <AddMediaForm hallSlug={slug} authorName={user.user_metadata?.full_name ?? user.email ?? "Usuario"} />
        ) : (
          <p className="text-sm text-gray-600">
            Debes estar logueado para subir contenido. <Link href="/login" className="underline">Iniciar sesión</Link>
          </p>
        )}
      </section>

      {/* Galería por ejemplar */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Galería</h2>
        {horsesWithNone.map((h) => {
          const list = byHorse[h.id] ?? [];
          if (list.length === 0) return null;
          return (
            <div key={h.id} className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{h.name}</h3>
                <span className="text-sm text-gray-500">{list.length} item(s)</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((m: any) => (
                  <li key={m.id} className="rounded-xl border overflow-hidden">
                    <div className="aspect-video bg-black/5 flex items-center justify-center">
                      {m.type === "image" && m.url ? (
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                          <Image
                            src={m.url}
                            alt={m.caption ?? "imagen"}
                            width={800}
                            height={450}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </a>
                      ) : m.type === "video" && m.url ? (
                        <video src={m.url} controls className="w-full h-full" />
                      ) : m.type === "youtube" && m.url ? (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${extractYouTubeId(m.url)}`}
                          title="YouTube video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <div className="text-sm text-gray-500 p-4">Contenido no disponible</div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-gray-600">
                          por <span className="font-medium">{m.author_name ?? "Anónimo"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{voteCounts[m.id] ?? 0}</span>
                          <VoteButton hallSlug={slug} mediaId={m.id} />
                        </div>
                      </div>
                      {m.caption ? <p className="text-sm">{m.caption}</p> : null}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{new Date(m.created_at).toLocaleString()}</span>
                        {m.type === "image" && m.url ? (
                          <a href={m.url} target="_blank" rel="noopener noreferrer" className="underline">
                            Ver original
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {media.length === 0 && <p className="text-sm text-gray-500">Aún no hay publicaciones.</p>}
      </section>

      <section className="rounded-2xl border p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4">Comentarios</h2>
        {user ? (
          <HallCommentForm hallSlug={slug} authorName={user.user_metadata?.full_name ?? user.email ?? "Usuario"} />
        ) : (
          <p className="text-sm text-gray-600">
            Debes estar logueado para comentar. <Link href="/login" className="underline">Iniciar sesión</Link>
          </p>
        )}
        <ul className="mt-6 space-y-4">
          {comments.map((c: any) => (
            <li key={c.id} className="border rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium">{c.author_name ?? "Anónimo"}</span>{" "}
                <span className="text-gray-500">· {new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-1">{c.content}</p>
            </li>
          ))}
          {comments.length === 0 && <p className="text-sm text-gray-500">Sé el primero en comentar.</p>}
        </ul>
      </section>
    </main>
  );
}
