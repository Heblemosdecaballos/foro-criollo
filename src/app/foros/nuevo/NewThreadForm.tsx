"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createThreadAction } from "./actions";

export default function NewThreadForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createThreadAction(formData);
      if (!res.ok) {
        setErrorMsg(res.message || "Error desconocido.");
        return;
      }
      // Redirige al detalle del hilo (ajusta la ruta real)
      router.push(`/foros/${res.id}`);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          name="title"
          type="text"
          required
          className="w-full border rounded p-2"
          placeholder="Ej. ¿Qué opinan del nuevo reglamento?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contenido</label>
        <textarea
          name="content"
          required
          rows={6}
          className="w-full border rounded p-2"
          placeholder="Escribe los detalles del tema a debatir…"
        />
      </div>

      {/* Si manejas categorías/foros */}
      {/* <div>
        <label className="block text-sm font-medium mb-1">Foro (opcional)</label>
        <input
          name="foro_id"
          type="text"
          className="w-full border rounded p-2"
          placeholder="UUID del foro/categoría"
        />
      </div> */}

      {errorMsg && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear foro"}
      </button>
    </form>
  );
}
