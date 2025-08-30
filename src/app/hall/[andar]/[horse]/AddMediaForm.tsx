"use client";

import { useState, useTransition } from "react";
import { uploadMediaAction } from "./actions";

export default function AddMediaForm({
  horseId, andar, horseSlug
}: { horseId: string; andar: string; horseSlug: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        start(async () => {
          const res = await uploadMediaAction(fd);
          if (!res.ok) setError(res.message || "Error al subir");
          (e.currentTarget as HTMLFormElement).reset();
        });
      }}
      className="space-y-3 rounded-2xl border bg-white/80 p-4"
    >
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">{error}</p>}
      <input type="hidden" name="horse_id" value={horseId} />
      <input type="hidden" name="andar" value={andar} />
      <input type="hidden" name="horse_slug" value={horseSlug} />

      <label className="block text-sm font-medium">Imágenes (jpg/png/webp)</label>
      <input name="images" type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="w-full" />

      <label className="block text-sm font-medium">Videos (mp4,mov)</label>
      <input name="videos" type="file" accept=".mp4,.mov" multiple className="w-full" />

      <label className="block text-sm font-medium">Documentos (pdf)</label>
      <input name="docs" type="file" accept=".pdf" multiple className="w-full" />

      <button disabled={pending} className="rounded-xl bg-green-700 px-4 py-2 text-white">
        {pending ? "Subiendo..." : "Subir archivos"}
      </button>
    </form>
  );
}
