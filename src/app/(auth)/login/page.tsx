// src/app/(auth)/login/page.tsx
import LoginWithGoogle from "@/components/LoginWithGoogle";
import EmailAuthForm from "@/components/EmailAuthForm";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Si ya hay sesión, no mostramos el formulario
  const supa = createSupabaseServerClientReadOnly();
  const { data: { user } } = await supa.auth.getUser();

  if (user) {
    return (
      <main className="container py-10 space-y-4">
        <p className="text-lg">Ya tienes sesión iniciada.</p>
        <div className="flex gap-4">
          <Link className="underline" href="/">Ir al inicio</Link>
          <Link className="underline" href="/perfil">Ir a tu perfil</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-10 space-y-6 max-w-md">
      <h1 className="text-2xl font-semibold">Acceder</h1>

      {/* Botón de Google (redirige a /auth/callback?next=/ ) */}
      <LoginWithGoogle />

      <div className="text-sm text-muted-foreground">o con correo</div>

      {/* Formulario email/contraseña (ingresar y registrarse) */}
      <EmailAuthForm />
    </main>
  );
}
