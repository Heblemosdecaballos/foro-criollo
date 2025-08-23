// /src/components/foro/CommentForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/utils/supabase/browser";

export default function CommentForm({ threadId }: { threadId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = String(fd.get("body") || "").trim();
    if (!body) return;

    setLoading(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.from("comments").insert({ thread_id: threadId, body });
    setLoading(false);
    if (error) return alert(error.message);
    (e.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        name="body"
        rows={3}
        placeholder="Escribe un comentario…"
        className="w-full rounded-lg border border-[#CFC8B9] bg-[#F8F5EC] px-3 py-2"
      />
      <button className="rounded-lg border border-[#14110F] bg-white px-3 py-2 text-sm" disabled={loading}>
        {loading ? "Enviando…" : "Comentar"}
      </button>
    </form>
  );
}
