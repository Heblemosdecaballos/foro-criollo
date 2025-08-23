"use client";
import { useState } from "react";

export default function NewsForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/noticias", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, content, cover_path: cover || null }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "No se pudo publicar");
      setTitle(""); setContent(""); setCover("");
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Error publicando");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 border rounded p-4">
      <h3 className="font-medium">Publicar noticia</h3>
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="w-full border rounded px-3 py-2"
        placeholder="Contenido"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Cover (URL opcional)"
        value={cover}
        onChange={(e) => setCover(e.target.value)}
      />
      <button
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Publicando..." : "Publicar"}
      </button>
    </form>
  );
}
