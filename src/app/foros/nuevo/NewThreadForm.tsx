"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createThreadAction } from "./actions";

type CreateThreadResult = { ok: boolean; slug?: string; message?: string };

export default function NewThreadForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = (await createThreadAction(formData)) as CreateThreadResult;
      if (!res.ok || !res.slug) {
        setErrorMsg(res.message || "Error desconocido.");
        return;
      }
      router.push(`/foros/${res.slug}`);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input name="title" required className="w-full border rounded p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Contenido</label>
        <textarea name="content" required rows={6} className="w-full border rounded p-2" />
      </div>
      {errorMsg && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded">{errorMsg}</p>
      )}
      <button type="submit" disabled={pending} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">
        {pending ? "Creando…" : "Crear foro"}
      </button>
    </form>
  );
}
