"use client";

import * as React from "react";
import { useTransition, useRef, useState } from "react";
import { addYoutubeAction } from "./actions";

export default function AddVideoForm({
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
      action={(formData: FormData) => {
        setErr(null);
        setOk(false);
        start(() => {
          void addYoutubeAction(formData)
            .then(() => {
              setOk(true);
              formRef.current?.reset();
            })
            .catch((e: any) => setErr(e?.message ?? "Error al guardar"));
        });
      }}
      className="space-y-3"
    >
      <input type="hidden" name="slug" value={slug} />
      <input
        type="text"
        name="youtube"
        placeholder="URL o ID de YouTube"
        required
        className="w-full border rounded p-2"
      />
      <input
        type="text"
        name="caption"
        placeholder="Caption (opcional)"
        className="w-full border rounded p-2"
      />
      <input
        type="text"
        name="credit"
        placeholder="Crédito (opcional)"
        className="w-full border rounded p-2"
      />
      <button disabled={pending} className="px-4 py-2 rounded bg-black text-white">
        {pending ? "Guardando..." : "Agregar video"}
      </button>

      {ok && <p className="text-green-600 text-sm">Video agregado.</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </form>
  );
}
