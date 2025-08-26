import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import NewPostForm from "./NewPostForm";

export default async function ThreadDetailPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const threadId = params.id;

  // Incrementar contador de visitas
  await supabase.rpc("increment_thread_views", { p_thread_id: threadId });

  // Datos del hilo
  const { data: thread, error: tErr } = await supabase
    .from("threads")
    .select("id, title, content, author_id, created_at, views, posts_count")
    .eq("id", threadId)
    .single();
  if (tErr || !thread) notFound();

  // Perfil del autor
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("id", thread.author_id)
    .single();

  // Respuestas
  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, author_id, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authorName = profile?.username || profile?.full_name || "Usuario";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{thread.title}</h1>
        <Link href="/foros" className="text-sm underline">
          ← Volver a Foros
        </Link>
      </div>

      <article className="rounded-2xl border bg-white p-5 shadow-sm mb-6">
        <div className="text-sm text-gray-500 mb-2">
          Por {authorName} • {new Date(thread.created_at).toLocaleString()} • {thread.views} visitas • {thread.posts_count} respuestas
        </div>
        <div className="prose max-w-none whitespace-pre-wrap">{thread.content}</div>
      </article>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-3">Respuestas</h2>
        {posts && posts.length ? (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id} className="rounded-xl border bg-white p-3 shadow-sm">
                <div className="whitespace-pre-wrap">{p.content}</div>
                <p className="text-xs text-gray-500 mt-2">
                  Publicado: {new Date(p.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Aún no hay respuestas.</p>
        )}
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-medium mb-2">Responder</h3>
        {user ? (
          <NewPostForm threadId={threadId} />
        ) : (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
            Debes iniciar sesión para publicar.
          </p>
        )}
      </section>
    </div>
  );
}
