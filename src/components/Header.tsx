import Link from "next/link";
import NavLinks from "./NavLinks";
import LoginWithGoogle from "./LoginWithGoogle";
import LogoutButton from "./LogoutButton";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export default async function Header() {
  const supa = createSupabaseServerClientReadOnly();
  const { data: { user } } = await supa.auth.getUser();

  return (
    <header className="border-b bg-card text-card-foreground">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold text-lg">
            Hablando de Caballos
          </Link>
          <NavLinks />
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <LogoutButton />
          ) : (
            <>
              <LoginWithGoogle />
              <Link href="/login" className="px-3 py-2 rounded-md border">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
