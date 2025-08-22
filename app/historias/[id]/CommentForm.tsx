"use client";

import { useState, useTransition } from "react";
import { addStoryComment } from "./actions";

type Props = {
  storyId: string;
  /** Opcional: nombre visible del usuario que comenta */
  viewerName?: string | null;
};

type ActionResp = { ok: boolean; error?: string };

export default function CommentForm({ storyId, viewerName }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);
        fd.set("story_id", storyId); // id oculto en el submit

        setError(null);
        start(() => {
          addStoryComment(fd)
            .then((res) => {
              const r = res as ActionResp; // ok + error? opcional
              if (!r.ok) {
                setError(r.error ?? "No se pudo comentar");
                return;
              }
              form.reset();
            })
            .catch(() => setError("No se pudo comentar"));
        });
      }}
    >
      {viewerName ? (
        <div className="text-xs text-neutral-600">
          Comentando como <strong>{viewerName}</strong>
        </div>
      ) : null}

      <textarea
        name="body"
        required
        minLength={2}
        rows={3}
        placeholder={viewerName ? `Escribe tu mensaje, ${viewerName}…` : "Escribe tu mensaje…"}
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
