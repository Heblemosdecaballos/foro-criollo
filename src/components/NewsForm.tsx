"use client";
import { useState, useTransition } from "react";
import { createNews } from "@/app/noticias/nueva/actions";

export default function NewsForm() {
  const [mode, setMode] = useState<"url"|"upload">("upload");
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-3 bg-white/70 p-4 rounded border"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("coverMode", mode);
        start(async ()=>{ await createNews(fd); (e.target as HTMLFormElement).reset(); });
      }}
    >
      <label className="block">
        <span className="text-sm">Título</span>
        <input name="title" required className="w-full border rounded px-3 py-2" />
      </label>

      <label className="block">
        <span className="text-sm">Contenido</span>
        <textarea name="content" required rows={16} className="w-full border rounded px-3 py-2" />
      </label>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1">
          <input type="radio" name="coverModeRadio" checked={mode==="upload"} onChange={()=>setMode("upload")} />
          Subir imagen
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="coverModeRadio" checked={mode==="url"} onChange={()=>setMode("url")} />
          Usar URL
        </label>
      </div>

      {mode === "upload" ? (
        <label className="block">
          <span className="text-sm">Archivo (PNG/JPG)</span>
          <input name="coverFile" type="file" accept="image/png,image/jpeg" className="w-full border rounded px-3 py-2" />
        </label>
      ) : (
        <label className="block">
          <span className="text-sm">URL de la portada</span>
          <input name="coverUrl" type="url" placeholder="https://..." className="w-full border rounded px-3 py-2" />
        </label>
      )}

      <button disabled={pending} className="px-3 py-2 rounded bg-[var(--brand-brown)] text-white">
        {pending ? "Publicando..." : "Publicar noticia"}
      </button>
    </form>
  );
}
