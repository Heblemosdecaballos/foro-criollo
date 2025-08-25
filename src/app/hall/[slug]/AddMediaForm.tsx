"use client";

import * as React from "react";
import { useTransition, useRef, useState } from "react";
import { addMediaAction } from "./actions";

type Props = {
  slug: string; // ← necesitamos el slug para la action del Hall
};

export default function AddMediaForm({ slug }: Props) {
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<"image" | "video" | "youtube">("image");
  const [ok, setOk] = useState(false);

  return (
    <form
      ref={formRef}
      className="space-y-2 bg-white/70 p-3 rounded border"
      onSubmit={(e) => {
        e.preventDefault();
        setOk(false);
        const fd = new FormData(e.currentTarget);
        // garantizamos el type seleccionado
        fd.set("type", type);

        // IMPORTANTe: la función pasada a startTransition NO debe ser async ni retornar nada.
        start(() => {
          void addMediaAction(slug, fd)
            .then(() => {
              setOk(true);
              formRef.current?.reset();
            })
            .catch((err) => {
              console.error(err);
              setOk(false);
            });
        });
      }}
    >
      <div className="flex gap-3 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="type-radio"
            value="image"
            checked={type === "image"}
            onChange={() => setType("image")}
          />
          Imagen
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="type-radio"
            value="video"
            checked={type === "video"}
            onChange={() => setType("video")}
          />
          Video (archivo)
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="type-radio"
            value="youtube"
            checked={type === "youtube"}
            onChange={() => setType("youtube")}
          />
          YouTube (URL)
        </label>
      </div>

      {/* Campo de archivo para image/video */}
      {type !== "youtube" && (
        <input
          name="file"
          type="file"
          className="w-full border rounded px-3 py-2"
          accept={type === "image" ? "image/*" : "video/*"}
        />
      )}

      {/* Campo de URL para YouTube */}
      {type === "youtube" && (
        <input
          name="youtubeUrl"
          type="url"
          placeholder="https://youtu.be/…"
          className="w-full border rounded px-3 py-2"
        />
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-3 py-2 rounded bg-[var(--brand-brown)] text-white"
      >
        {pending ? "Subiendo…" : "Subir al Hall"}
      </button>

      {ok && (
        <p className="text-sm text-green-700">
          ¡Listo! Se cargó el contenido.
        </p>
      )}
    </form>
  );
}
