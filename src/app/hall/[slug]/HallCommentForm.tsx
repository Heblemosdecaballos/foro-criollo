"use client";

import * as React from "react";
import { useTransition, useRef, useState } from "react";
import { addHallComment } from "./actions";

type Props = {
  slug: string; // ← pasamos el slug del Hall como prop
};

export default function HallCommentForm({ slug }: Props) {
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [ok, setOk] = useState(false);

  return (
    <form
      ref={formRef}
      className="space-y-2 bg-white/70 p-3 rounded border"
      onSubmit={(e) => {
        e.preventDefault();
        setOk(false);
        const fd = new FormData(e.currentTarget);

        // startTransition NO debe recibir una función async
        start(() => {
          void addHallComment(slug, fd)
            .then(() => {
              setOk(true);
              formRef.current?.reset();
            })
            .catch((err) => {
              console.error(err);
              setOk(false);
              alert("No se pudo publicar el comentario.");
            });
        });
      }}
    >
      <textarea
        name="body"
        rows={4}
        placeholder="Escribe un comentario…"
        className="w-full border rounded px-3 py-2"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="px-3 py-2 rounded bg-[var(--brand-green)] text-white"
      >
        {pending ? "Publicando…" : "Comentar"}
      </button>

      {ok && <p className="text-sm text-green-700">¡Comentario publicado!</p>}
    </form>
  );
}
