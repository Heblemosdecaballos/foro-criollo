
// app/historias/nueva/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

function supaClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

type MediaItem = {
  url: string;
  kind: "image" | "video";
  width?: number;
  height?: number;
  duration_seconds?: number;
  fileName?: string;
};

export default function NuevaHistoriaPage() {
  const supabase = supaClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length || !user) return;
    setUploading(true);
    const uploaded: MediaItem[] = [];

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) continue;

      const storyId = crypto.randomUUID(); // carpeta temporal por archivo
      const path = `stories/${user.id}/${storyId}/${file.name}`;
      const { data, error } = await supabase.storage.from("stories").upload(path, file, { upsert: false });
      if (error) { alert(error.message); setUploading(false); return; }

      const { data: pub } = supabase.storage.from("stories").getPublicUrl(path);
      uploaded.push({
        url: pub.publicUrl,
        kind: isImage ? "image" : "video",
        fileName: file.name
      });
    }

    setMedia(prev => [...prev, ...uploaded]);
    setUploading(false);
  }

  async function publicar() {
    if (!user) { alert("Debes iniciar sesión"); return; }
    const res = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, media })
    });
    const json = await res.json();
    if (!res.ok) { alert(json.error ?? "Error al publicar"); return; }
    router.push(`/historias/${json.id}`);
  }

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Nueva historia</h1>

      {!user && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900">
          Inicia sesión para publicar.
        </div>
      )}

      <input
        type="text"
        className="w-full rounded border p-2"
        placeholder="Título (opcional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={!user}
      />

      <textarea
        className="w-full rounded border p-2 min-h-32"
        placeholder="Texto (opcional)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={!user}
      />

      <div className="rounded border border-dashed p-4">
        <label className="block cursor-pointer">
          <span className="mb-2 inline-block text-sm text-neutral-600">
            Sube imágenes o videos (puedes seleccionar varios)
          </span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={!user || uploading}
          />
          <div className="mt-2 rounded bg-neutral-100 p-3 text-center">
            {uploading ? "Subiendo…" : "Haz click aquí para seleccionar archivos"}
          </div>
        </label>

        {media.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {media.map((m, i) => (
              <div key={i} className="rounded border p-1">
                {m.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt={m.fileName ?? "media"} className="aspect-video w-full object-cover rounded" />
                ) : (
                  <video className="aspect-video w-full rounded" src={m.url} controls />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={publicar}
          disabled={!user || uploading}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Publicar
        </button>
      </div>
    </main>
  );
}
