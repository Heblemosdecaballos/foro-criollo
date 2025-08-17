import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // Sólo protegemos /historias/nueva
  if (!req.nextUrl.pathname.startsWith("/historias/nueva")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay sesión -> redirige a /auth?redirect=/historias/nueva
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirect", "/historias/nueva");
    return NextResponse.redirect(url);
  }

  return res;
}

// Aplica sólo a esta ruta
export const config = {
  matcher: ["/historias/nueva"],
};
