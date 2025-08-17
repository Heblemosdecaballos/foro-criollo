// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function supa(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set({ name, value, ...options }),
        remove: (name, options) => res.cookies.set({ name, value: "", ...options, maxAge: 0 }),
      },
    }
  );
}

// GET: OAuth ?code=... -> guarda cookies y redirige
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const next = url.searchParams.get("redirect") ?? url.searchParams.get("next") ?? "/";
  const res = NextResponse.redirect(new URL(next, req.url));

  const code = url.searchParams.get("code");
  if (!code) return res;

  const sb = supa(req, res);
  await sb.auth.exchangeCodeForSession(code);
  return res;
}

// POST: onAuthStateChange del cliente -> refresca cookies servidor
export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const sb = supa(req, res);
  await sb.auth.getUser();
  return res;
}
