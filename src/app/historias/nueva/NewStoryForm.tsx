"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStoryAction, type ActionResp } from "./actions";

export default function NewStoryForm() {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="space-y-3 bg-white/70 p-4 rounded border"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        const fd = new FormData(e.currentTarget);
        fd.set("coverMode", mode);

        start(async () => {
          const res: ActionResp = await createStoryAction(fd);
          if (res.ok) {
            setMsg("¡Historia publicada!");
            router.push("/historias");
          } else {
            setMsg(res.error || "No se pudo publicar la historia.");
          }
        });
      }}
    >
      <label className="block">
        <span className="text-sm">Título</span>
        <input
          name="title"
          required
          className="w-full border rounded px-3 py-2"
          placeholder="Título de la historia"
        />
      </label>

      <label className="block">
        <span className="text-sm">Contenido</span>
        <textarea
          name="content"
          required
          rows={16}
          className="w-full border rounded px-3 py-2"
          placeholder="Escribe aquí tu historia…"
        />
      </label>

      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="coverModeRadio"
            checked={mode === "upload"}
            onChange={() => setMode("upload")}
          />
          Subir imagen (PNG/JPG)
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="coverModeRadio"
            checked={mode === "url"}
            onChange={() => setMode("url")}
          />
          Usar URL
        </label>
      </div>

      {mode === "upload" ? (
        <label className="block">
          <span className="text-sm">Archivo</span>
          <input
            name="coverFile"
            type="file"
            accept="image/png,image/jpeg"
            className="w-full border rounded px-3 py-2"
          />
        </label>
      ) : (
        <label className="block">
          <span className="text-sm">URL de portada</span>
          <input
            name="coverUrl"
            type="url"
            placeholder="https://..."
            className="w-full border rounded px-3 py-2"
          />
        </label>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-3 py-2 rounded bg-[var(--brand-brown)] text-white disabled:opacity-60"
      >
        {pending ? "Publicando…" : "Publicar historia"}
      </button>

      {msg && <p className="text-sm text-amber-700">{msg}</p>}
    </form>
  );
}
