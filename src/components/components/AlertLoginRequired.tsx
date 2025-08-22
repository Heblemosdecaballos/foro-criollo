"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AlertLoginRequired({ redirect }: { redirect?: string }) {
  const pathname = usePathname();
  const dest = redirect || pathname || "/";

  return (
    <div className="mb-3 rounded border border-amber-300 bg-amber-50 p-3 text-amber-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <strong>Necesitas iniciar sesión</strong> para publicar. Tu contenido se conservará al iniciar sesión.
        </div>
        <div className="flex gap-2">
          <Link
            href={`/auth?redirect=${encodeURIComponent(dest)}`}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
          >
            Iniciar sesión
          </Link>
          <Link
            href={`/auth?redirect=${encodeURIComponent(dest)}`}
            className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
