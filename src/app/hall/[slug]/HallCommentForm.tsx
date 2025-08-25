"use client";

import { useState, useTransition } from "react";
import { addHallComment } from "./actions";

export default function HallCommentForm({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        startTransition(async () => {
          try {
            await addHallComment(slug, fd);
          } catch (e) {
            setErr((e as Error).message);
          }
        });
      }}
      className="space-y-3"
    >
      <textarea
        name="text"
        rows={4}
        required
        placeholder="Escribe tu comentario…"
        className="w-full rounded border border-black/20 px-3 py-2 text-sm"
        disabled={pending}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-black/20 bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {pending ? "Publicando..." : "Comentar"}
        </button>
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
    </form>
  );
}
