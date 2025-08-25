// src/components/hall/AddMediaForm.tsx
"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = { hallSlug: string; authorName: string };

export default function AddMediaForm({ hallSlug, authorName }: Props) {
  const [mode, setMode] = useState<"image" | "video" | "youtube">("image");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      let payload: any = { hall_slug: hallSlug, type: mode, caption, author_name: authorName };

      if (mode === "youtube") {
        if (!youtubeUrl) throw new Error("Incluye la URL de YouTube");
        payload.url = youtubeUrl;
      } else {
        if (!file) throw new Error("Selecciona un archivo");
        const supabase = supabaseBrowser();
        const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
        const path = `${hallSlug}/${crypto.randomUUID()}.${ext}`;

        // 1) Upload a Storage bucket "hall"
        const { error: upErr } = await supabase.storage.from("hall").upload(path, file, { upsert: false });
        if (upErr) {
          // error del SDK (antes de llamar a la API)
          throw new Error(`StorageError: ${upErr.message}`);
        }

        // 2) Obtener URL pública
        const { data: publicUrl } = supabase.storage.from("hall").getPublicUrl(path);
        payload.url = publicUrl.publicUrl;
        payload.storage_path = path;
      }

      // 3) Insert en BD (API)
      const res = await fetch("/api/hall/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Mostrar mensaje real de error
        let msg = `HTTP ${res.status}`;
        try {
          const txt = await res.text();
          try {
            const j = JSON.parse(txt);
            msg = j?.error || txt || msg;
          } catch {
            msg = txt || msg;
          }
        } catch {}
        throw new Error(msg || "Error creando media");
      }

      // OK
      setFile(null);
      setYoutubeUrl("");
      setCaption("");
      router.refresh();
      alert("¡Publicación creada!");
    } catch (err: any) {
      alert(err?.message || "Error creando media");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("image")}
          className={`px-3 py-1 rounded-full border ${mode === "image" ? "bg-black text-white" : "bg-white"}`}
        >
          Imagen
        </button>
        <button
          type="button"
          onClick={() => setMode("video")}
          className={`px-3 py-1 rounded-full border ${mode === "video" ? "bg-black text-white" : "bg-white"}`}
        >
          Video
        </button>
        <button
          type="button"
          onClick={() => setMode("youtube")}
          className={`px-3 py-1 rounded-full border ${mode === "youtube" ? "bg-black text-white" : "bg-white"}`}
        >
          YouTube
        </button>
      </div>

      {mode !== "youtube" ? (
        <input
          type="file"
          accept={mode === "image" ? "image/*" : "video/*"}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
      ) : (
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      )}

      <input
        type="text"
        placeholder="Caption (opcional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <div>
        <button disabled={loading} className="px-4 py-2 rounded-lg bg-black text-white text-sm">
          {loading ? "Subiendo..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
