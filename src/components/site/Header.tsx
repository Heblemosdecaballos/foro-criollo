import Link from "next/link";
import Image from "next/image";
import { supabaseServer } from "@/lib/supabase/server";

/** Ajusta aquí tus enlaces del menú si hace falta */
const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Foros", href: "/foros" },
  { label: "Hall", href: "/hall" },
  { label: "Recursos", href: "/recursos" },
];

/**
 * ⚠️ Logo oficial: NO cambiar la ruta.
 * - Archivo real:  public/brand/horse.png
 * - Acceso público desde el app:  /brand/horse.png
 */
const BRAND = {
  name: "Hablando de Caballos",
  logoSrc: "/brand/horse.png", // <— ¡esta es la ruta que pides!
  logoW: 28,
  logoH: 28,
};

export default async function Header() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={BRAND.logoSrc}
            alt={`${BRAND.name} logo`}
            width={BRAND.logoW}
            height={BRAND.logoH}
            priority
          />
          <span className="font-semibold text-lg">{BRAND.name}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/foros/nuevo"
            className="rounded-full bg-green-600 px-4 py-2 text-white shadow-sm hover:shadow"
          >
            Crear Foro
          </Link>
          {user ? (
            <Link href="/perfil" className="rounded-full border px-4 py-2">
              Mi cuenta
            </Link>
          ) : (
            <Link href="/login" className="rounded-full border px-4 py-2">
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        <details className="md:hidden">
          <summary className="cursor-pointer rounded-full border px-3 py-2 text-sm">
            Menú
          </summary>
          <div className="absolute right-4 mt-2 w-56 rounded-xl border bg-white p-2 shadow-lg">
            <div className="flex flex-col">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="rounded px-3 py-2 hover:bg-gray-50">
                  {item.label}
                </Link>
              ))}
              <hr className="my-2" />
              <Link href="/foros/nuevo" className="rounded px-3 py-2 hover:bg-gray-50">
                + Crear Foro
              </Link>
              {user ? (
                <Link href="/perfil" className="rounded px-3 py-2 hover:bg-gray-50">
                  Mi cuenta
                </Link>
              ) : (
                <Link href="/login" className="rounded px-3 py-2 hover:bg-gray-50">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
