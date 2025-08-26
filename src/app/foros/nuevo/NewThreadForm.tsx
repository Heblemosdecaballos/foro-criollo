// src/app/foros/nuevo/NewThreadForm.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createThreadAction } from "./actions";

export default function NewThreadForm() {
  const search = useSearchParams();
  const serverError = search.get("error") || "";

  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={createThreadAction} className="space-y-5 max-w-2xl">
      {serverError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {serverError}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm text-brown-700/80">Título *</label>
        <input
          name="title"
          required
          className="w-full h-12 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
          placeholder="Escribe un título atractivo"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm text-brown-700/80">Categoría</label>
          <select
            name="category"
            className="w-full h-12 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
            defaultValue="general"
          >
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
          <label className="block text-sm text-brown-700/80">Visibilidad</label>
          <select
            name="visibility"
            className="w-full h-12 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
            defaultValue="public"
          >
            <option value="public">Pública</option>
            <option value="private">Privada</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-brown-700/80">Etiquetas (separadas por coma)</label>
        <input
          name="tags"
          className="w-full h-11 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
          placeholder="paso fino, genética, potros"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-brown-700/80">Contenido *</label>
        <textarea
          name="content"
          required
          rows={7}
          className="w-full rounded-xl border border-brown-700/30 bg-cream-50 px-3 py-2 outline-none focus:ring-2 focus:ring-brown-700/20"
          placeholder="Describe tu tema o pregunta…"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-brown-700/80">Imagen de portada (opcional)</label>
        <input
          type="file"
          name="cover"
          accept="image/*"
          className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-olive-600 file:px-4 file:py-2 file:text-white hover:file:bg-olive-700"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return setPreview(null);
            const url = URL.createObjectURL(f);
            setPreview(url);
          }}
        />
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="mt-2 h-36 w-full object-cover rounded-lg border border-brown-700/20"
          />
        ) : null}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="h-11 rounded-xl bg-olive-600 text-white font-medium hover:bg-olive-700 transition px-5"
        >
          Publicar hilo
        </button>
      </div>
    </form>
  );
}
