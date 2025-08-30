import Link from "next/link";
import Image from "next/image";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Logo oficial (NO cambiar la ruta):
 * - Archivo físico: public/brand/horse.png
 * - URL pública:    /brand/horse.png
 */
const BRAND = {
  name: "Hablando de Caballos",
  logoSrc: "/brand/horse.png",
  w: 28,
  h: 28,
};

/** Menú (orden según tu diseño) */
const NAV = [
  { label: "Foros",         href: "/foros" },
  { label: "Noticias",      href: "/noticias" },
  { label: "Historias",     href: "/historias" },
  { label: "Transmisiones", href: "/transmisiones" },
  { label: "Hall of Fame",  href: "/hall" },
  { label: "Chat en Vivo",  href: "/chat" },
  { label: "Instalar app",  href: "/instalar" },
];

export default async function Header() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-site-beige/95 backdrop-blur supports-[backdrop-filter]:bg-site-beige/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={BRAND.logoSrc}
            alt={`${BRAND.name} logo`}
            width={BRAND.w}
            height={BRAND.h}
            priority
          />
          <span className="font-serif text-xl font-semibold">{BRAND.name}</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-6 text-[15px]">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-neutral-800 hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Acciones derecha */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-neutral-700">Hola, {user.email?.split("@")[0] || "usuario"}</span>
              <Link href="/perfil" className="rounded-full border px-4 py-2 bg-white/70 hover:bg-white">
                Mi cuenta
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full border px-4 py-2 bg-white/70 hover:bg-white">
                Iniciar sesión
              </Link>
              <Link href="/registro" className="rounded-full bg-green-700 px-4 py-2 text-white shadow-sm hover:shadow">
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Menú móvil */}
        <details className="lg:hidden">
          <summary className="cursor-pointer rounded-full border px-3 py-2 text-sm bg-white/70">
            Menú
          </summary>
          <div className="absolute right-4 mt-2 w-64 rounded-xl border bg-white p-2 shadow-lg">
            <div className="flex flex-col">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="rounded px-3 py-2 hover:bg-gray-50">
                  {item.label}
                </Link>
              ))}
              <hr className="my-2" />
              {user ? (
                <Link href="/perfil" className="rounded px-3 py-2 hover:bg-gray-50">Mi cuenta</Link>
              ) : (
                <>
                  <Link href="/login" className="rounded px-3 py-2 hover:bg-gray-50">Iniciar sesión</Link>
                  <Link href="/registro" className="rounded px-3 py-2 hover:bg-gray-50 text-green-700">Registrarse</Link>
                </>
              )}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
