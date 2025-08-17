// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";   // evita caché
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
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  try {
    if (code) {
      // formatos antiguos
      // @ts-ignore
      await db.auth.exchangeCodeForSession(code);
    } else {
      // formatos nuevos (URL completa)
      // @ts-ignore
      await db.auth.exchangeCodeForSession(req.url);
    }
  } catch (_) {
    // no interrumpir el flujo
  }

  const redirect = url.searchParams.get("redirect") || "/";
  return NextResponse.redirect(new URL(redirect, url.origin));
}
