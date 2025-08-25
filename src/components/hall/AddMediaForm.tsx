// src/components/hall/AddMediaForm.tsx
"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";

type Horse = { id: string; slug: string; name: string };
type Props = { hallSlug: string; authorName: string };

export default function AddMediaForm({ hallSlug, authorName }: Props) {
  const [mode, setMode] = useState<"image" | "video" | "youtube">("image");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [horseId, setHorseId] = useState<string>("");
  const [newHorseName, setNewHorseName] = useState("");
  const router = useRouter();

  async function loadHorses() {
    const res = await fetch(`/api/hof/horses?hall_slug=${encodeURIComponent(hallSlug)}`, { cache: "no-store" });
    if (res.ok) {
      const list: any[] = await res.json();
      setHorses(list as any);
    }
  }

  useEffect(() => {
    loadHorses();
  }, [hallSlug]);

  async function createHorseInline() {
    if (!newHorseName.trim()) {
      alert("Escribe el nombre del ejemplar");
      return;
    }
    const res = await fetch("/api/hof/horses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hall_slug: hallSlug, name: newHorseName }),
    });
    if (!res.ok) {
      const t = await res.text();
      try { throw new Error(JSON.parse(t)?.error || t); } catch { throw new Error(t); }
    }
    const horse = await res.json();
    setHorses((prev) => [...prev, horse]);
    setHorseId(horse.id);
    setNewHorseName("");
  }

  function slugify(s: string) {
    return s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      let payload: any = {
        hall_slug: hallSlug,
        type: mode,
        caption,
        author_name: authorName,
        horse_id: horseId || null,
      };

      if (mode === "youtube") {
        if (!youtubeUrl) throw new Error("Incluye la URL de YouTube");
        payload.url = youtubeUrl;
      } else {
        if (!file) throw new Error("Selecciona un archivo");
        const supabase = supabaseBrowser();
        const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";

        // Carpeta por ejemplar si existe; si no, _misc_
        const horse = horses.find((h) => h.id === horseId);
        const horseFolder = horse ? slugify(horse.slug || horse.name) : "_misc_";
        const path = `${hallSlug}/${horseFolder}/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage.from("hall").upload(path, file, { upsert: false });
        if (upErr) throw new Error(`StorageError: ${upErr.message}`);

        const { data: publicUrl } = supabase.storage.from("hall").getPublicUrl(path);
        payload.url = publicUrl.publicUrl;
        payload.storage_path = path;
      }

      const res = await fetch("/api/hof/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        const txt = await res.text();
        try { msg = JSON.parse(txt)?.error || txt || msg; } catch { msg = txt || msg; }
        throw new Error(msg || "Error creando media");
      }

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
      {/* Modo */}
      <div className="flex gap-2 text-sm">
        {(["image","video","youtube"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-full border ${mode===m?"bg-black text-white":"bg-white"}`}
          >
            {m==="image"?"Imagen":m==="video"?"Video":"YouTube"}
          </button>
        ))}
      </div>

      {/* Ejemplar */}
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="text-sm block mb-1">Ejemplar (opcional)</label>
          <select
            value={horseId}
            onChange={(e)=>setHorseId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">— Sin ejemplar —</option>
            {horses.map((h)=>(
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm block mb-1">Crear nuevo ejemplar</label>
          <div className="flex gap-2">
            <input
              value={newHorseName}
              onChange={(e)=>setNewHorseName(e.target.value)}
              placeholder="Nombre del ejemplar"
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button type="button" onClick={createHorseInline} className="px-3 py-2 rounded-lg border text-sm">
              Crear
            </button>
          </div>
        </div>
      </div>

      {/* Archivo o URL */}
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

      {/* Caption */}
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
