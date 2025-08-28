import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import NewPostForm from "./NewPostForm";
import EditorThread from "./EditorThread";
import PostItem from "./PostItem";

function isUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

/** ----------  METADATA DINÁMICA POR HILO  ---------- */
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const supabase = supabaseServer();
  const param = params.slug;

  // intenta por slug
  let { data: t } = await supabase
    .from("threads")
    .select("title, content, is_deleted, slug")
    .eq("slug", param)
    .single();

  // si no hay y parece UUID, busca por id y redirige en la propia página (metadata usa fallback)
  if ((!t || t.is_deleted) && isUUID(param)) {
    const { data: byId } = await supabase
      .from("threads")
      .select("slug, title, content, is_deleted")
      .eq("id", param)
      .single();
    t = byId || t;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://hablandodecaballos.com";

  const title = t?.title ? `${t.title}` : "Hilo del foro";
  const description =
    t?.content?.slice(0, 140) ||
    "Debate ecuestre en la comunidad Hablando de Caballos.";

  const slug = t?.slug || param;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/foros/${slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/foros/${slug}`,
      images: [`${siteUrl}/foros/${slug}/opengraph-image`],
      type: "article",
    },
  };
}

/** ----------  PÁGINA DEL HILO  ---------- */
export default async function ThreadDetailBySlug({ params }: { params: { slug: string } }) {
  const supabase = supabaseServer();
  const param = params.slug;

  // 1) Intentar por slug
  let { data: thread } = await supabase
    .from("threads")
    .select("id, title, content, author_id, created_at, views, posts_count, is_deleted, slug")
    .eq("slug", param)
    .single();

  // 2) Si no existe por slug y el parámetro parece UUID, intenta por ID y redirige al slug canónico
  if ((!thread || thread.is_deleted) && isUUID(param)) {
    const { data: byId } = await supabase
      .from("threads")
      .select("slug, is_deleted")
      .eq("id", param)
      .single();

    if (!byId || byId.is_deleted) {
      notFound();
    }
    redirect(`/foros/${byId.slug}`);
  }

  if (!thread || thread.is_deleted) {
    notFound();
  }

  // Incrementar visitas
  await supabase.rpc("increment_thread_views", { p_thread_id: thread.id });

  // Autor
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, is_moderator")
    .eq("id", thread.author_id)
    .single();

  // Usuario actual (permisos UI)
  const { data: { user } } = await supabase.auth.getUser();
  let meIsMod = false;
  if (user) {
    const { data: me } = await supabase
      .from("profiles")
      .select("is_moderator")
      .eq("id", user.id)
      .single();
    meIsMod = !!me?.is_moderator;
  }
  const canEditThread = !!user && (user.id === thread.author_id || meIsMod);

  // Respuestas (no borradas)
  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, author_id, created_at, is_deleted")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  const authorName = profile?.username || profile?.full_name || "Usuario";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{thread.title}</h1>
        <Link href="/foros" className="text-sm underline">← Volver a Foros</Link>
      </div>

      <article className="rounded-2xl border bg-white p-5 shadow-sm mb-6">
        <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={authorName} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200" />
          )}
          <span>Por {authorName}</span>
          <span>•</span>
          <span>{new Date(thread.created_at).toLocaleString()}</span>
          <span>•</span>
          <span>{thread.views} visitas</span>
          <span>•</span>
          <span>{thread.posts_count} respuestas</span>
        </div>
        <div className="prose max-w-none whitespace-pre-wrap">{thread.content}</div>
      </article>

      {canEditThread && (
        <div className="mb-6">
          <EditorThread thread={{ id: thread.id, title: thread.title, content: thread.content }} />
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-3">Respuestas</h2>
        {posts && posts.length ? (
          <ul className="space-y-3">
            {posts.filter(p => !p.is_deleted).map((p) => (
              <PostItem
                key={p.id}
                post={{ id: p.id, content: p.content, created_at: p.created_at }}
                canEdit={!!user && (user.id === p.author_id || meIsMod)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Aún no hay respuestas.</p>
        )}
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-medium mb-2">Responder</h3>
        {user ? (
          <NewPostForm threadId={thread.id} />
        ) : (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
            Debes iniciar sesión para publicar.
          </p>
        )}
      </section>
    </div>
  );
}
