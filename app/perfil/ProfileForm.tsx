"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "./actions";

type Props = {
  initialName?: string | null;
  initialBio?: string | null;
};

type ActionResp = { ok: boolean; error?: string };

export default function ProfileForm({ initialName, initialBio }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);

        setError(null);
        setOk(false);

        startTransition(async () => {
          try {
            const res = (await updateProfileAction(fd)) as ActionResp;
            if (!res.ok) {
              setError(res.error ?? "No se pudo guardar");
            } else {
              setOk(true);
            }
          } catch {
            setError("No se pudo guardar");
          }
        });
      }}
    >
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          name="full_name"
          defaultValue={initialName ?? ""}
          placeholder="Tu nombre"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          minLength={2}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          name="bio"
          defaultValue={initialBio ?? ""}
          placeholder="Cuéntanos algo sobre ti"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          rows={4}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg border border-[#14110F] bg-[#14110F] px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Guardar cambios"}
        </button>

        {ok && <span className="text-sm text-green-700">Guardado</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
