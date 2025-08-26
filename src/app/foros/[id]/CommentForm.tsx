"use client";

import { useState, useTransition } from "react";
import { addCommentAction } from "./actions";

export default function CommentForm({ threadId, initialError }: { threadId: string; initialError?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(initialError);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(undefined);
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        startTransition(async () => {
          try {
            await addCommentAction(threadId, fd);
          } catch (err) {
            // Por si llegara a lanzar en cliente (normalmente redirect corta en el server)
            setError((err as Error).message);
          }
        });
      }}
      className="space-y-3"
    >
      <textarea
        name="text" // 👈 nombre correcto del campo
        rows={4}
        placeholder="Escribe tu comentario..."
        className="w-full rounded-md border border-black/20 px-3 py-2 text-sm outline-none focus:ring-2"
        disabled={pending}
        required
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-black/20 bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Publicando..." : "Comentar"}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
