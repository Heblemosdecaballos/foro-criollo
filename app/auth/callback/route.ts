// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function serverClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );
}

// 1) OAuth: /auth/callback?code=...&redirect=/historias/nueva
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("redirect") ?? url.searchParams.get("next") ?? "/";

  const res = NextResponse.redirect(new URL(next, req.url));
  if (!code) return res;

  const supabase = serverClient(req, res);
  await supabase.auth.exchangeCodeForSession(code);

  return res;
}

// 2) Cliente avisa cambios de sesión (onAuthStateChange)
export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const supabase = serverClient(req, res);
  // leer user fuerza al helper a sincronizar cookies en la respuesta
  await supabase.auth.getUser();
  return res;
}
