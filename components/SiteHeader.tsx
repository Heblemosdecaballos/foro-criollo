"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import ThemeToggle from "./ThemeToggle";

function supa() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgb(var(--surface))]/90 backdrop-blur">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="HC" className="h-8 w-8 rounded-md" />
          <span className="text-lg font-semibold">Hablando de Caballos</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link href="/noticias" className="btn-outline">Noticias</Link>
          <Link href="/historias" className="btn-outline">Historias</Link>
          <Link href="/threads" className="btn-outline">Foro</Link>

          <Link href="/historias/nueva" className="btn-brand hidden sm:inline-flex">+ Publicar</Link>
          <ThemeToggle />

          {user ? (
            <Link href="/logout" className="btn-outline" title={user.email || "Cerrar sesión"}>
              Salir
            </Link>
          ) : (
            <Link href={`/auth?redirect=${redirect}`} className="btn-outline">
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
