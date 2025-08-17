// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

export default function SiteHeader() {
  const sb = supa();
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, [sb]);

  const redirect = encodeURIComponent(pathname || "/");

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Hablando de Caballos" className="h-8 w-8 rounded-md" />
          <span className="text-lg font-semibold tracking-tight">Hablando de Caballos</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/noticias" className="hover:underline">Noticias</Link>
          <Link href="/historias" className="hover:underline">Historias</Link>
          <Link href="/threads" className="hover:underline">Foro</Link>

          {/* CTA publicar siempre lleva a /historias/nueva */}
          <Link
            href="/historias/nueva"
            className="hidden sm:inline-flex rounded-md px-3 py-1.5 text-white"
            style={{ backgroundColor: "rgb(var(--brand))" }}
          >
            + Publicar
          </Link>

          {/* Login / Logout */}
          {user ? (
            <Link
              href="/logout"
              className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
              title={user.email || "Cerrar sesión"}
            >
              Salir
            </Link>
          ) : (
            <Link
              href={`/auth?redirect=${redirect}`}
              className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
