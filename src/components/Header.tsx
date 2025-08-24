import Link from "next/link";
import NavLinks from "./NavLinks";
import LogoutButton from "./LogoutButton";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export default async function Header() {
  const supa = createSupabaseServerClientReadOnly();
  const { data: { user } } = await supa.auth.getUser();

  return (
    <header className="site-header">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="site-brand font-semibold text-lg">
            Hablando de Caballos
          </Link>
          <NavLinks />
        </div>

        <div className="header-actions flex items-center gap-2">
          {user ? (
            <>
              <Link href="/perfil" className="link-outline">Mi perfil</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="link-fill">Iniciar sesión</Link>
              <Link href="/login?signup=1" className="link-outline">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
