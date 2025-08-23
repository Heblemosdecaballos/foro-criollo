// src/components/HallCommentForm.tsx
"use client";

import { useState } from "react";

export default function HallCommentForm({ slug }: { slug: string }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/hall/${slug}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo publicar el comentario");
      }
      setContent("");
      // Opcional: refrescar la página para ver el nuevo comentario
      if (typeof window !== "undefined") window.location.reload();
    } catch (err: any) {
      setError(err?.message || "Error desconocido");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        name="content"
        className="flex-1 border rounded px-3 py-2"
        placeholder="Escribe un comentario…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button
        className="bg-black text-white px-4 rounded disabled:opacity-60"
        disabled={sending}
      >
        {sending ? "Publicando…" : "Publicar"}
      </button>
      {error && <div className="text-red-600 text-sm ml-2">{error}</div>}
    </form>
  );
}
