// src/app/foros/nuevo/NewThreadForm.tsx
"use client";

import { useTransition } from "react";
import { createThreadAction } from "@/app/foros/nuevo/actions"; // ← path nuevo

export default function NewThreadForm() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={createThreadAction}
      className="space-y-4 max-w-2xl"
      onSubmit={(e) => {
        // opcional: transición para deshabilitar el botón
        startTransition(() => {});
      }}
    >
      <div className="space-y-2">
        <label className="block text-sm text-brown-700/80">Título</label>
        <input
          name="title"
          required
          className="w-full h-12 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
          placeholder="Escribe un título atractivo"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-brown-700/80">Categoría</label>
        <select
          name="category"
          className="w-full h-12 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
          defaultValue=""
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          <option value="general">General</option>
          <option value="entrenamiento">Entrenamiento</option>
          <option value="crianza">Crianza y Genética</option>
          <option value="competencias">Competencias</option>
          <option value="salud">Salud Veterinaria</option>
          <option value="historia">Historia y Tradición</option>
          <option value="comercial">Comercialización</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-brown-700/80">Contenido</label>
        <textarea
          name="content"
          rows={6}
          required
          className="w-full rounded-xl border border-brown-700/30 bg-cream-50 px-3 py-2 outline-none focus:ring-2 focus:ring-brown-700/20"
          placeholder="Describe tu tema o pregunta…"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-olive-600 text-white font-medium hover:bg-olive-700 transition px-5 disabled:opacity-60"
      >
        {pending ? "Publicando…" : "Publicar hilo"}
      </button>
    </form>
  );
}
