import ReplyEditor from "../../../components/ReplyEditor";
import { createSupabaseServer } from "../../../utils/supabase/server";
import Link from "next/link";

type PageProps = { params: { id: string } };

export default async function ThreadPage({ params }: PageProps) {
  const supabase = createSupabaseServer();

  const { data: thread, error: threadErr } = await supabase
    .from("threads")
    .select("id, title, created_at")
    .eq("id", params.id)
    .single();

  if (threadErr || !thread) {
    return (
      <main className="mx-auto max-w-4xl p-4">
        <p className="mb-3">Hilo no encontrado.</p>
        <Link href="/" className="text-blue-600 underline">Volver</Link>
      </main>
    );
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, body, author_id, created_at")
    .eq("thread_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-4xl p-4 space-y-6">
      <header className="border-b pb-3">
        <h1 className="text-2xl font-semibold">{thread.title}</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Creado el {new Date(thread.created_at).toLocaleString()}
        </p>
      </header>

      <section className="space-y-4">
        {(posts ?? []).map((p) => (
          <article key={p.id} className="rounded border p-3">
            <div className="mb-1 text-xs text-neutral-500">
              Autor: {p.author_id} · {new Date(p.created_at).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">{p.body}</div>
          </article>
        ))}
        {(!posts || posts.length === 0) && (
          <div className="rounded border border-dashed p-6 text-center text-neutral-500">
            Aún no hay respuestas. ¡Sé el primero en comentar!
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-medium">Responder</h2>
        <ReplyEditor threadId={thread.id} />
      </section>
    </main>
  );
}
