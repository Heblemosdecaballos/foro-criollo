"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ANDARES } from "@/lib/hall/types";
import { createHorseAction } from "./actions";

export default function NewHallForm({ defaultAndar }: { defaultAndar?: string }) {
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [andar, setAndar] = useState(defaultAndar || ANDARES[0].slug);
  const [desc, setDesc] = useState("");
  const [ped, setPed] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await createHorseAction({ name, andar_slug: andar, description: desc, pedigree_url: ped });
          if (!res.ok) return alert(res.message || "No se pudo crear");
          router.push(`/hall/${res.andar}/${res.slug}`);
        });
      }}
      className="rounded-2xl border bg-white/80 p-6 space-y-4"
    >
      <div>
        <label className="block text-sm mb-1">Nombre</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Andar</label>
        <select
          className="w-full rounded border px-3 py-2"
          value={andar}
          onChange={(e) => setAndar(e.target.value)}
        >
          {ANDARES.map(a => (
            <option key={a.slug} value={a.slug}>{a.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Descripción (opcional)</label>
        <textarea
          className="w-full rounded border px-3 py-2"
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">URL Pedigrí (PDF o imagen) (opcional)</label>
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="https://..."
          value={ped}
          onChange={(e) => setPed(e.target.value)}
        />
      </div>

      <button
        disabled={pending}
        className="rounded bg-green-700 text-white px-4 py-2"
      >
        {pending ? "Creando…" : "Crear ejemplar"}
      </button>
    </form>
  );
}
