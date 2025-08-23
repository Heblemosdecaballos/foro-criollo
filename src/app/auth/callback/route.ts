// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  // Permite redirigir a una ruta interna: /, /perfil, etc.
  const next = url.searchParams.get("next");
  const safePath = next && next.startsWith("/") ? next : "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        } as any, // tolera cambios de tipos menores
      }
    );

    // Canjea el `code` por la sesión y setea cookies en tu dominio
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(safePath, url.origin));
}
