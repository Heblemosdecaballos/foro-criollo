// /src/components/hall/HallCommentForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { hallSlug: string; authorName: string };

export default function HallCommentForm({ hallSlug, authorName }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/hall/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hall_slug: hallSlug, content, author_name: authorName }),
      });
      if (!res.ok) throw new Error(await res.text());
      setContent("");
      router.refresh();
    } catch (e: any) {
      alert(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe un comentario…"
        className="flex-1 border rounded-lg px-3 py-2 text-sm"
      />
      <button disabled={loading || !content.trim()} className="px-4 py-2 rounded-lg bg-black text-white text-sm">
        {loading ? "Enviando…" : "Comentar"}
      </button>
    </form>
  );
}
