import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
  // Intercambia ?code por sesión
  await db.auth.exchangeCodeForSession(req.url).catch(() => {});
  const redirect = new URL(req.url).searchParams.get("redirect") || "/";
  const dest = new URL(redirect, req.nextUrl.origin);
  return NextResponse.redirect(dest);
}
