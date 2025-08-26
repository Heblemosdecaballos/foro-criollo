// src/app/registro/page.tsx
import Link from "next/link";
import { createSupabaseServer } from "@/src/lib/supabase/server";
import { register } from "@/app/actions/register"; // <-- FIX de la ruta

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RegisterPage() {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <main className="container py-16">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-2xl mb-2">Ya estás registrado</h1>
          <p className="text-brown-700/80">
            Tu sesión está activa. Vuelve al{" "}
            <Link href="/" className="underline">inicio</Link>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-16">
      <div className="max-w-lg mx-auto">
        <h1 className="text-center font-serif text-2xl text-brown-800">Crear Cuenta</h1>
        <p className="mt-1 text-center text-brown-700/80">
          Únete a la comunidad del Caballo Criollo Colombiano
        </p>

        <form action={register} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-brown-700/80">Nombre</label>
            <input
              type="text" name="full_name" required
              className="w-full h-12 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-brown-700/80">Correo</label>
            <input
              type="email" name="email" required
              className="w-full h-12 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-brown-700/80">Contraseña</label>
            <input
              type="password" name="password" required minLength={6}
              className="w-full h-12 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button type="submit" className="w-full h-11 rounded-xl bg-olive-600 text-white font-medium hover:bg-olive-700 transition">
            Registrarme
          </button>
        </form>

        <p className="mt-6 text-center text-brown-700/80">
          ¿Ya tienes cuenta? <Link href="/login" className="underline">Iniciar Sesión</Link>
        </p>
      </div>
    </main>
  );
}
