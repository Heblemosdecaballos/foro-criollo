"use client";

import * as React from "react";
import { useTransition, useRef, useState } from "react";
import { addMediaAction } from "./actions";

type Props = {
  slug: string;
  profileId?: string; // opcional por compatibilidad con versiones anteriores
};

export default function AddVideoForm({ slug }: Props) {
  const [pending, start] = useTransition();
  const [ok, setOk] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="space-y-2 bg-white/70 p-3 rounded border"
      onSubmit={(e) => {
        e.preventDefault();
        setOk(false);
        const fd = new FormData(e.currentTarget);
        // Forzamos a que sea un aporte de tipo YouTube
        fd.set("type", "youtube");

        start(() => {
          void addMediaAction(slug, fd)
            .then(() => {
              setOk(true);
              formRef.current?.reset();
            })
            .catch((err) => {
              console.error(err);
              setOk(false);
              alert("No se pudo guardar el video de YouTube.");
            });
        });
      }}
    >
      <label className="block">
        <span className="text-sm">URL de YouTube</span>
        <input
          name="youtubeUrl"
          type="url"
          placeholder="https://youtu.be/..."
          className="w-full border rounded px-3 py-2"
          required
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="px-3 py-2 rounded bg-[var(--brand-brown)] text-white"
      >
        {pending ? "Subiendo…" : "Agregar video de YouTube"}
      </button>

      {ok && <p className="text-sm text-green-700">¡Listo! Video agregado.</p>}
    </form>
  );
}
