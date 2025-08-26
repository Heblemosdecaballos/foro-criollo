// src/app/threads/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const threadId = params.id;

  const { data: thread, error: tErr } = await supabase
    .from("threads")
    .select("id, title, content, created_at")
    .eq("id", threadId)
    .single();

  if (tErr || !thread) {
    notFound();
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{thread.title}</h1>
        <Link href="/foros" className="text-sm underline">← Volver a Foros</Link>
      </div>

      <article className="border rounded p-4 mb-6 bg-white">
        <div className="prose max-w-none whitespace-pre-wrap">{thread.content}</div>
        <p className="text-xs text-gray-500 mt-3">
          Creado: {new Date(thread.created_at).toLocaleString()}
        </p>
      </article>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-3">Respuestas</h2>
        {posts && posts.length ? (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id} className="border rounded p-3 bg-white">
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
    </div>
  );
}
