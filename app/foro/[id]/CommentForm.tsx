"use client";

import { useState, useTransition } from "react";
import { addThreadComment } from "./actions";

type Props = {
  threadId: string;
};

type ActionResp = { ok: boolean; error?: string };

export default function CommentForm({ threadId }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);
        fd.set("thread_id", threadId); // id oculto en el submit

        setError(null);
        start(() => {
          addThreadComment(fd)
            .then((res) => {
              const r = res as ActionResp; // tipado plano: ok + error?
              if (!r.ok) {
                setError(r.error ?? "No se pudo comentar");
                return;
              }
              // Si tu action hace revalidatePath, el comentario aparecerá al recargar la ruta.
              form.reset();
            })
            .catch(() => setError("No se pudo comentar"));
        });
      }}
    >
      <textarea
        name="body"
        required
        minLength={2}
        rows={3}
        placeholder="Escribe tu comentario…"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-[#14110F] bg-[#14110F] px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Comentar"}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
