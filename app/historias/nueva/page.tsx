"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import AlertLoginRequired from "../../../components/AlertLoginRequired";

function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

export default function NuevaHistoriaPage() {
  const sb = supa();
  const [user, setUser] = useState<any>(null);

  // Campos básicos (puedes ampliar)
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, [sb]);

  async function onSubmit() {
    if (!user) return;
    setSaving(true);

    // Aquí va tu lógica real de publicar historia (mantengo ejemplo mínimo)
    const res = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text, files: files.map((f) => f.name) }),
    });

    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "No se pudo publicar");
      return;
    }
    setTitle("");
    setText("");
    setFiles([]);
    alert("¡Historia enviada!");
  }

  const disabled = !user || saving;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Nueva historia</h1>

      {/* Aviso con botones cuando NO hay sesión */}
      {!user && <AlertLoginRequired redirect="/historias/nueva" />}

      <label className="block text-sm">
        <span className="text-neutral-600">Título (opcional)</span>
        <input
          className="mt-1 w-full rounded border p-2"
          placeholder="Título (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled}
        />
      </label>

      <label className="block text-sm">
        <span className="text-neutral-600">Texto (opcional)</span>
        <textarea
          className="mt-1 h-48 w-full rounded border p-2"
          placeholder="Escribe tu historia..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
        />
      </label>

      <div className="rounded border border-dashed p-4">
        <div className="mb-2 text-sm text-neutral-600">
          Sube imágenes o videos (puedes seleccionar varios)
        </div>
        <label className="block cursor-pointer rounded bg-neutral-100 p-4 text-center">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            disabled={disabled}
          />
          Haz click aquí para seleccionar archivos
        </label>
        {files.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-sm text-neutral-600">
            {files.map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </main>
  );
}
