"use client";

import { useState, useTransition } from "react";
import { addMediaAction, addYoutubeAction } from "./actions";

export default function AddMediaForm({ slug }: { slug: string }) {
  const [tab, setTab] = useState<"file" | "youtube">("file");
  const [type, setType] = useState<"image" | "video">("image");
  const [yt, setYt] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <section className="rounded-lg bg-white p-4">
      <div className="mb-3 flex gap-2 text-sm">
        <button
          type="button"
          className={`rounded px-2 py-1 ${tab === "file" ? "bg-black text-white" : "bg-black/5"}`}
          onClick={() => setTab("file")}
        >
          Archivo
        </button>
        <button
          type="button"
          className={`rounded px-2 py-1 ${tab === "youtube" ? "bg-black text-white" : "bg-black/5"}`}
          onClick={() => setTab("youtube")}
        >
          YouTube URL
        </button>
      </div>

      {tab === "file" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErr(null);
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            fd.set("type", type);
            startTransition(async () => {
              try {
                await addMediaAction(slug, fd);
              } catch (e) {
                setErr((e as Error).message);
              }
            });
          }}
          className="space-y-3"
        >
          <div className="flex gap-2 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="rtype"
                checked={type === "image"}
                onChange={() => setType("image")}
              />
              Imagen
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="rtype"
                checked={type === "video"}
                onChange={() => setType("video")}
              />
              Video
            </label>
          </div>

          <input
            name="file"
            type="file"
            accept={type === "image" ? "image/*" : "video/*"}
            required
            className="w-full text-sm"
          />

          <button
            type="submit"
            disabled={pending}
            className="rounded border border-black/20 bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {pending ? "Subiendo..." : "Subir"}
          </button>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErr(null);
            startTransition(async () => {
              try {
                await addYoutubeAction(slug, yt.trim());
              } catch (e) {
                setErr((e as Error).message);
              }
            });
          }}
          className="space-y-3"
        >
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={yt}
            onChange={(e) => setYt(e.target.value)}
            required
            className="w-full rounded border border-black/20 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded border border-black/20 bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {pending ? "Agregando..." : "Agregar YouTube"}
          </button>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>
      )}
    </section>
  );
}
