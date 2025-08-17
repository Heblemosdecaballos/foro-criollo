"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

type Uploadable = File & { preview?: string };

export default function NewStoryForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<Uploadable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const f = Array.from(e.target.files || []) as Uploadable[];
    setFiles((prev) => [...prev, ...f]);
  }

  async function handlePublish() {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Debes iniciar sesión.");

      // 1) Crear historia
      const { data: story, error: insErr } = await supabase
        .from("stories")
        .insert({
          title: title || null,
          body: body || null,
          author_id: user.id,
        })
        .select("*")
        .single();

      if (insErr || !story) throw insErr || new Error("No se pudo crear la historia.");

      // 2) Subir archivos (si hay)
      const uploadedUrls: { url: string; kind: "image" | "video" }[] = [];

      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
        const path = `${user.id}/${story.id}/${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: upErr } = await supabase.storage.from("stories").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from("stories").getPublicUrl(path);
        const isVideo = /mp4|webm|mov|avi|mkv/.test(ext);
        uploadedUrls.push({ url: pub.publicUrl, kind: isVideo ? "video" : "image" });
      }

      if (uploadedUrls.length) {
        const { error: mediaErr } = await supabase.from("story_media").insert(
          uploadedUrls.map((m) => ({
            story_id: story.id,
            url: m.url,
            kind: m.kind,
          }))
        );
        if (mediaErr) throw mediaErr;
      }

      // 3) Redirigir a la historia recién creada
      router.push(`/historias/${story.id}`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Error al publicar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-6 mt-4 space-y-4">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-2">
        <label className="text-sm font-medium">Título (opcional)</label>
        <input
          className="rounded-xl border px-3 py-2"
          placeholder="Escribe un título…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Texto (opcional)</label>
        <textarea
          rows={6}
          className="rounded-xl border px-3 py-2"
          placeholder="Cuéntanos tu historia…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Sube imágenes o videos (opcional)</label>
        <input type="file" multiple onChange={onSelectFiles} />
        {!!files.length && (
          <p className="text-xs text-black/60 dark:text-white/60">{files.length} archivo(s) listo(s)</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handlePublish}
          disabled={loading}
          className="btn-brand disabled:opacity-60"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </section>
  );
}
