// src/app/login/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Server Action local: iniciar sesión */
async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/"); // al home
}

export default async function LoginPage() {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <main className="container py-16">
      <div className="max-w-lg mx-auto">
        <h1 className="text-center font-serif text-2xl text-brown-800">
          Iniciar Sesión
        </h1>
        <p className="mt-1 text-center text-brown-700/80">
          Accede a tu cuenta
        </p>

        {/* mensaje de error opcional */}
        {/* Puedes leer el search param en un client component si quieres mostrar el texto */}

        <form action={loginAction} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-brown-700/80">Correo</label>
            <input
              type="email"
              name="email"
              required
              className="w-full h-12 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-brown-700/80">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              className="w-full h-12 rounded-xl border border-brown-700/30 bg-cream-50 px-3 outline-none focus:ring-2 focus:ring-brown-700/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-olive-600 text-white font-medium hover:bg-olive-700 transition"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="mt-6 text-center text-brown-700/80">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
