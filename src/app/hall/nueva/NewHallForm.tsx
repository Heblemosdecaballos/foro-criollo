// src/app/hall/nueva/NewHallForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createHorseAction } from "./actions";

type Props = {
  defaultAndar?: string;
};

const ANDARES = [
  { slug: "paso-fino", label: "Paso Fino" },
  { slug: "trocha", label: "Trocha" },
  { slug: "galope", label: "Galope" },
  { slug: "trote-y-galope", label: "Trote y Galope" },
  // agrega los que tengas en tu tabla `andares`
];

export default function NewHallForm({ defaultAndar }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const [name, setName] = useState("");
  const [andar, setAndar] = useState(defaultAndar ?? ANDARES[0]?.slug ?? "");
  const [desc, setDesc] = useState("");
  const [ped, setPed] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await createHorseAction({
        name,
        andar_slug: andar,
        description: desc,
        pedigree_url: ped || null,
      });

      if (!res.ok) {
        alert(res.message || "No se pudo crear");
        return;
      }

      // Redirige a la ficha del ejemplar
      router.push(`/hall/${res.andar}/${res.slug}`);
    });
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
          {ANDARES.map((a) => (
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
