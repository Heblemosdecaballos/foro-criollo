// /app/hall/[slug]/page.tsx
import { createSupabaseServer } from "@/src/lib/supabase/server";
import AddMediaForm from "@/src/components/hall/AddMediaForm";
import HallCommentForm from "@/src/components/hall/HallCommentForm";
import VoteButton from "@/src/components/hall/VoteButton";
import Link from "next/link";
import Image from "next/image";

type Props = { params: { slug: string } };

async function getData(slug: string) {
  const supabase = createSupabaseServer();

  // Hall
  const { data: hall, error: hallErr } = await supabase
    .from("halls")
    .select("*")
    .eq("slug", slug)
    .single();

  if (hallErr) throw hallErr;

  // Media (orden reciente)
  const { data: media, error: mediaErr } = await supabase
    .from("hall_media")
    .select("*")
    .eq("hall_slug", slug)
    .order("created_at", { ascending: false });

  if (mediaErr) throw mediaErr;

  // Comments (últimos 50)
  const { data: comments, error: commentsErr } = await supabase
    .from("hall_comments")
    .select("*")
    .eq("hall_slug", slug)
    .order("created_at", { ascending: false })
    .limit(50);

  if (commentsErr) throw commentsErr;

  // Conteo de votos por media (simple: una query por media id)
  const voteCounts: Record<string, number> = {};
  if (media && media.length) {
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

  // Conteo de votos globales del hall
  const { count: hallVotesCount } = await supabase
    .from("hall_votes")
    .select("*", { count: "exact", head: true })
    .eq("hall_slug", slug)
    .is("media_id", null);

  // Usuario (para mostrar forms solo si está logueado)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { hall, media: media ?? [], comments: comments ?? [], voteCounts, hallVotesCount: hallVotesCount ?? 0, user };
}

export default async function HallPage({ params }: Props) {
  const { slug } = params;
  const { hall, media, comments, voteCounts, hallVotesCount, user } = await getData(slug);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-10">
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
              <VoteButton hallSlug={slug} />{/* voto global (media_id = null) */}
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

      <section>
        <h2 className="text-xl font-semibold mb-4">Galería</h2>
        {media.length === 0 && <p className="text-sm text-gray-500">Aún no hay publicaciones.</p>}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.map((m: any) => (
            <li key={m.id} className="rounded-xl border overflow-hidden">
              <div className="aspect-video bg-black/5 flex items-center justify-center">
                {m.type === "image" && m.url ? (
                  <Image
                    src={m.url}
                    alt={m.caption ?? "imagen"}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : m.type === "video" && m.url ? (
                  <video src={m.url} controls className="w-full h-full" />
                ) : m.type === "youtube" && m.url ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${extractYouTubeId(m.url)}`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-sm text-gray-500 p-4">Contenido no disponible</div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-gray-600">por <span className="font-medium">{m.author_name ?? "Anónimo"}</span></div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{voteCounts[m.id] ?? 0}</span>
                    <VoteButton hallSlug={slug} mediaId={m.id} />
                  </div>
                </div>
                {m.caption ? <p className="text-sm">{m.caption}</p> : null}
                <div className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
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
