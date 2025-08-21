"use client";

import * as React from "react";
import { useTransition, useRef, useState } from "react";
import { addMediaAction } from "./actions";

type Props = {
  profileId: string;
  slug: string;
};

export default function AddMediaForm({ profileId, slug }: Props) {
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
        // IMPORTANTe: la función pasada a startTransition NO debe ser async ni retornar nada.
        start(() => {
          void addMediaAction(fd)
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
      {/* --- Tus inputs existentes (no cambian los name) --- */}
      <div className="space-y-2">
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="block w-full"
        />
        <input
          type="text"
          name="youtube"
          placeholder="URL o ID de YouTube (opcional si subes imagen)"
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
      </div>

      <button disabled={pending} className="px-4 py-2 rounded bg-black text-white">
        {pending ? "Guardando..." : "Agregar media"}
      </button>

      {ok && <p className="text-green-600 text-sm">Guardado correctamente.</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </form>
  );
}
