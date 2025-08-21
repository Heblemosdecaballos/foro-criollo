"use client";

import * as React from "react";
import { useTransition, useState, useRef } from "react";
import { addHallComment } from "./actions";

export default function HallCommentForm({
  profileId,
  slug,
}: {
  profileId: string;
  slug: string;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(fd: FormData) => {
        setErr(null);
        setOk(false);
        start(() => {
          void addHallComment(fd)
            .then(() => {
              setOk(true);
              formRef.current?.reset();
            })
            .catch((e: any) => setErr(e?.message ?? "No se pudo comentar"));
        });
      }}
      className="space-y-3"
    >
      <input type="hidden" name="slug" value={slug} />
      <textarea
        name="comment"
        required
        minLength={2}
        placeholder="Escribe tu comentario…"
        className="w-full border rounded p-2 min-h-[96px]"
      />
      <div className="flex items-center gap-2">
        <button disabled={pending} className="px-4 py-2 rounded bg-black text-white">
          {pending ? "Enviando…" : "Comentar"}
        </button>
        {ok && <span className="text-green-600 text-sm">Comentario publicado.</span>}
        {err && <span className="text-red-600 text-sm">{err}</span>}
      </div>
    </form>
  );
}
