"use client";

import { useState, useTransition } from "react";
import { ANDARES } from "@/lib/hall/types";
import { createHorseAction } from "./actions";
import { useRouter } from "next/navigation";

export default function NewHallForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setError(null);

    startTransition(async () => {
      const res = await createHorseAction(data);
      if (!res.ok) setError(res.message || "Error");
      else router.push(`/hall/${res.andar}/${res.slug}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white/80 p-6">
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">{error}</p>}

      <div>
        <label className="block text-sm font-medium">Nombre del Ejemplar</label>
        <input name="name" required className="mt-1 w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Andar</label>
        <select name="andar" required className="mt-1 w-full rounded border px-3 py-2">
          {ANDARES.map(a => <option key={a.slug} value={a.slug}>{a.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea name="description" rows={4} className="mt-1 w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Pedigrí (URL PDF/imagen opcional)</label>
        <input name="pedigree_url" type="url" className="mt-1 w-full rounded border px-3 py-2" />
      </div>

      <button disabled={pending} className="rounded-xl bg-green-700 px-4 py-2 text-white">
        {pending ? "Creando..." : "Crear Ejemplar"}
      </button>
    </form>
  );
}
