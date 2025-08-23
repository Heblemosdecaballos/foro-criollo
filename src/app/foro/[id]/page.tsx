// /src/app/foro/[id]/page.tsx
import CommentForm from "@/components/foro/CommentForm";
import { supabaseServer } from "@/lib/supabase/server";

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();

  const [{ data: thread }, { data: comments }] = await Promise.all([
    supabase.from("threads").select("id, title, body, category, created_at").eq("id", params.id).maybeSingle(),
    supabase
      .from("comments")
      .select("id, body, created_at")
      .eq("thread_id", params.id)
      .order("created_at", { ascending: true }),
  ]);

  if (!thread) {
    return <div className="text-sm text-[#14110F]/70">Hilo no encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#D7D2C7] bg-white p-4">
        <h1 className="text-2xl font-bold">{thread.title}</h1>
        <div className="mt-1 text-xs text-[#14110F]/60">
          {thread.category} · {new Date(thread.created_at).toLocaleString()}
        </div>
        {thread.body && <p className="mt-4 whitespace-pre-wrap">{thread.body}</p>}
      </div>

      <div className="rounded-xl border border-[#D7D2C7] bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Comentarios</h2>
        <ul className="space-y-3">
          {(comments ?? []).map((c) => (
            <li key={c.id} className="rounded-lg border border-[#E7E2D6] bg-[#F8F5EC] p-3">
              <div className="text-sm whitespace-pre-wrap">{c.body}</div>
              <div className="mt-1 text-[11px] text-[#14110F]/60">
                {new Date(c.created_at).toLocaleString()}
              </div>
            </li>
          ))}
          {!comments?.length && <li className="text-sm text-[#14110F]/70">Aún no hay comentarios.</li>}
        </ul>

        <div className="mt-4">
          <CommentForm threadId={params.id} />
        </div>
      </div>
    </div>
  );
}
