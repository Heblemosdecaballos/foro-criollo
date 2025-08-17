// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";         // evita cualquier caché
export const fetchCache = "force-no-store";

function supa() {
  const c = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get: (n) => c.get(n)?.value,
      set: (n, v, o) => { try { c.set({ name: n, value: v, ...o }); } catch {} },
      remove: (n, o) => { try { c.set({ name: n, value: "", ...o }); } catch {} },
    },
  });
}

export async function GET(req: NextRequest) {
  const db = supa();

  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  try {
    if (code) {
      // Forma clásica: pasar el code directamente
      // @ts-ignore - según versión de supabase-js, acepta string
      await db.auth.exchangeCodeForSession(code);
    } else {
      // Forma moderna: pasar la URL completa
      // @ts-ignore - versiones nuevas aceptan req.url
      await db.auth.exchangeCodeForSession(req.url);
    }
  } catch (e) {
    // no romper, igual redirigimos
  }

  const redirect = searchParams.get("redirect") || "/";
  return NextResponse.redirect(new URL(redirect, origin));
}
