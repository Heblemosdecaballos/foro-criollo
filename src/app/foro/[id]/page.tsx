// src/app/foro/[id]/page.tsx
import Link from "next/link";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import CommentForm from "./CommentForm";

type Thread = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  author_id: string | null;
};

type Comment = {
  id: string;
  text: string;
  created_at: string;
  author_id: string | null;
};

export const dynamic = "force-dynamic";

async function getThread(id: string) {
  const supa = createSupabaseServerClient();
  const { data, error } = await supa
    .from("threads")
    .select("id,title,category,created_at,author_id")
    .eq("id", id)
    .maybeSingle<Thread>();

  if (error) throw error;
  return data;
}

async function getComments(threadId: string) {
  const supa = createSupabaseServerClient();
  const { data, error } = await supa
    .from("thread_comments")
    .select("id,text,created_at,author_id")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as Comment[]) || [];
}

export default async function ThreadPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  const thread = await getThread(params.id);
  if (!thread) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p>Hilo no encontrado.</p>
      </main>
    );
  }

  const comments = await getComments(thread.id);
  const initialError = searchParams?.error;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-4">
        <Link href="/foro" className="text-sm opacity-70 hover:underline">
          ← Volver al foro
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{thread.title}</h1>
        <div className="mt-1 text-sm opacity-70">
          <span className="rounded bg-black/5 px-1.5 py-0.5">{thread.category}</span>{" "}
          · {new Date(thread.created_at).toLocaleString()}
        </div>
      </header>

      {/* (Opcional) contenido inicial si lo guardas como primer comment */}
      {comments.length === 0 && (
        <p className="mb-6 text-sm italic opacity-60">Sin contenido.</p>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Comentarios</h2>
        {comments.length === 0 ? (
          <p className="mb-3 text-sm opacity-70">Sé el primero en comentar.</p>
        ) : (
          <ul className="mb-6 space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="rounded-md bg-white p-3">
                <div className="text-sm">{c.text}</div>
                <div className="mt-1 text-xs opacity-60">
                  {new Date(c.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}

        <CommentForm threadId={thread.id} initialError={initialError} />
      </section>
    </main>
  );
}
