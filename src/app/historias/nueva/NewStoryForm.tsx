"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStoryAction } from "./actions";

type ActionResp = { ok: boolean; id?: string; error?: string };

export default function NewStoryForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);

        setError(null);
        start(() => {
          createStoryAction(fd)
            .then((res) => {
              const r = res as ActionResp; // <- tipo plano: ok + id? + error?
              if (r.ok) {
                // Si tu action devuelve id de la historia nueva, navega a ella;
                // si no, regresa al listado.
                if (r.id) router.push(`/historias/${r.id}`);
                else router.push("/historias");
              } else {
                setError(r.error ?? "No se pudo guardar");
              }
            })
            .catch(() => setError("No se pudo guardar"));
        });
      }}
    >
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          name="title"
          required
          minLength={3}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Título de la historia"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contenido</label>
        <textarea
          name="body"
          required
          rows={6}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Escribe tu historia…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-[#14110F] bg-[#14110F] px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Publicar historia"}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
