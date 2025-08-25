"use client";

import { useState, useTransition } from "react";
import { addHallComment } from "./actions";

export default function HallCommentForm({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null); setOkMsg(null);
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        startTransition(async () => {
          const res = await addHallComment(slug, fd);
          if (!res.ok) setErr(res.error);
          else {
            setOkMsg("Comentario publicado.");
            (e.currentTarget as HTMLFormElement).reset();
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
        {okMsg && <span className="text-sm text-green-700">{okMsg}</span>}
      </div>
    </form>
  );
}
