import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Header server component (lee cookies para saber si hay usuario)
 * - Menú responsive sin JS usando <details> para mobile
 * - Botón "Crear Foro"
 */
export default async function Header() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">🐴</span>
          <span className="text-lg">Hablando de Caballos</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 md:flex text-sm">
          <Link href="/" className="hover:underline">
            Inicio
          </Link>
          <Link href="/foros" className="hover:underline">
            Foros
          </Link>
          <Link href="/hall" className="hover:underline">
            Hall
          </Link>
          <Link href="/recursos" className="hover:underline">
            Recursos
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/foros/nuevo"
            className="rounded-xl bg-green-600 px-3 py-2 text-white shadow-sm hover:shadow"
          >
            Crear Foro
          </Link>

          {user ? (
            <Link href="/perfil" className="rounded-xl border px-3 py-2">
              Mi cuenta
            </Link>
          ) : (
            <Link href="/login" className="rounded-xl border px-3 py-2">
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        <details className="md:hidden">
          <summary className="cursor-pointer rounded-xl border px-3 py-2 text-sm">
            Menú
          </summary>
          <div className="absolute right-4 mt-2 w-56 rounded-xl border bg-white p-2 shadow-lg">
            <div className="flex flex-col">
              <Link href="/" className="rounded px-3 py-2 hover:bg-gray-50">
                Inicio
              </Link>
              <Link href="/foros" className="rounded px-3 py-2 hover:bg-gray-50">
                Foros
              </Link>
              <Link href="/hall" className="rounded px-3 py-2 hover:bg-gray-50">
                Hall
              </Link>
              <Link href="/recursos" className="rounded px-3 py-2 hover:bg-gray-50">
                Recursos
              </Link>
              <hr className="my-2" />
              <Link
                href="/foros/nuevo"
                className="rounded px-3 py-2 hover:bg-gray-50"
              >
                + Crear Foro
              </Link>
              {user ? (
                <Link
                  href="/perfil"
                  className="rounded px-3 py-2 hover:bg-gray-50"
                >
                  Mi cuenta
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded px-3 py-2 hover:bg-gray-50"
                >
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
