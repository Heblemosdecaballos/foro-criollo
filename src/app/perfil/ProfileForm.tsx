"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "./actions";

type ProfileObj = {
  email?: string | null;
  full_name?: string | null;
  username?: string | null;
  phone?: string | null;
  bio?: string | null;
};

type Props = {
  /** Forma 1: props sueltas */
  initialName?: string | null;
  initialBio?: string | null;
  /** Forma 2: objeto profile completo (como lo pasas desde la page) */
  profile?: ProfileObj;
};

type ActionResp = { ok: boolean; error?: string };

export default function ProfileForm({ initialName, initialBio, profile }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // Normalizamos valores iniciales desde la fuente disponible
  const defaultName = (profile?.full_name ?? initialName ?? "") as string;
  const defaultBio = (profile?.bio ?? initialBio ?? "") as string;

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
          defaultValue={defaultName}
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
          defaultValue={defaultBio}
          placeholder="Cuéntanos algo sobre ti"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          rows={4}
        />
      </div>

      {/* Campos opcionales extra si alguna vez decides mostrarlos
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Usuario</label>
          <input name="username" defaultValue={profile?.username ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input name="phone" defaultValue={profile?.phone ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
      </div>
      */}

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
