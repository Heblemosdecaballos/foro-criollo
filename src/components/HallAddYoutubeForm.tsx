"use client";
import { useState } from "react";

export default function HallAddYoutubeForm({ slug }: { slug: string }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/hall/${encodeURIComponent(slug)}/media`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storage_path: url, media_type: "video" }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "No se pudo registrar el video");
      setUrl("");
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="flex-1 border rounded px-3 py-2"
        placeholder="Pega URL de YouTube"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <button className="px-3 py-2 rounded bg-secondary" disabled={loading}>
        {loading ? "Agregando..." : "Agregar"}
      </button>
    </form>
  );
}
