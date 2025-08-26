// src/components/site/Header.tsx
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServer } from "@/src/lib/supabase/server";
import { logout } from "../../app/actions/logout"; // ← RUTA RELATIVA FIJA

const NAV = [
  { href: "/foros", label: "Foros" },
  { href: "/noticias", label: "Noticias" },
  { href: "/historias", label: "Historias" },
  { href: "/transmisiones", label: "Transmisiones" },
  { href: "/hall", label: "Hall of Fame" },
  { href: "/chat", label: "Chat en Vivo" },
  { href: "/app", label: "📱 Instalar app" },
];

// Server component (sin "use client")
export default async function Header() {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    undefined;

  return (
    <header className="w-full sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-brown-700/10">
      <div className="container h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/brand/horse.png" alt="Caballo" width={28} height={28} priority />
          <span className="font-serif text-[18px] md:text-[20px] leading-none font-semibold text-brown-700">
            Hablando de Caballos
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-[14px] text-brown-700 hover:bg-cream-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <span className="rounded-full border border-brown-700/20 px-3 py-1.5 text-sm text-brown-700">
                Hola, <b>{userName}</b>
              </span>
              <form action={logout}>
                <button className="btn btn-ghost">Salir</button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-brown-700/20 px-4 py-1.5 text-sm text-brown-700 hover:bg-cream-100"
              >
                Iniciar Sesión
              </Link>
              <Link href="/registro" className="btn btn-olive">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
