"use client";
import * as React from "react";
import { useTransition } from "react";
import { addYoutubeAction } from "./actions";

export default function AddVideoForm({ profileId, slug }: { profileId: string; slug: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = React.useState<string | null>(null);

  return (
    <form
      action={(formData: FormData) => {
        setErr(null);
        // IMPORTANTe: la función pasada a `start` debe devolver void
        start(() => {
          void addYoutubeAction(formData).catch((e) => setErr(e?.message ?? "Error"));
        });
      }}
      className="space-y-3"
    >
      <input type="hidden" name="slug" value={slug} />
      {/* ...tus inputs... */}
      <button disabled={pending}>{pending ? "Guardando..." : "Agregar video"}</button>
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </form>
  );
}
