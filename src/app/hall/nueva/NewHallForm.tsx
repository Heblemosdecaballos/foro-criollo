// src/app/hall/nueva/NewHallForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createHorseAction } from "./actions";

type Andar = { slug: string; label: string };

type Props = {
  defaultAndar?: string;
  andares: Andar[];
};

export default function NewHallForm({ defaultAndar, andares }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const initialAndar = defaultAndar && andares.some(a => a.slug === defaultAndar)
    ? defaultAndar
    : (andares[0]?.slug ?? "");

  const [name, setName] = useState("");
  const [andar, setAndar] = useState(initialAndar);
  const [desc, setDesc] = useState("");
  const [ped, setPed] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await createHorseAction({
        name,
        andar_slug: andar,
        description: desc || null,
        pedigree_url: ped || null,
      });

      if (!res.ok) {
        alert(res.message || "No se pudo crear");
        return;
      }
      router.push(`/hall/${res.andar}/${res.slug}`);
    });
  }

  if (!andares.length) {
    return (
      <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded">
        No hay andares definidos. Por favor crea andares primero.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Nombre del ejemplar</label>
        <input
          className="border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. 'Tormento de la Sierra'"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Andar</label>
        <select
          className="border rounded px-3 py-2"
          value={andar}
          onChange={(e) => setAndar(e.target.value)}
          required
        >
          {andares.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Descripción</label>
        <textarea
          className="border rounded px-3 py-2 min-h-[100px]"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Breve descripción del ejemplar…"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">URL Pedigree (opcional)</label>
        <input
          className="border rounded px-3 py-2"
          value={ped}
          onChange={(e) => setPed(e.target.value)}
          placeholder="https://…"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear ejemplar"}
      </button>
    </form>
  );
}
