import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function supa() {
  const c = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => c.get(n)?.value,
        set: (n, v, o) => { try { c.set({ name: n, value: v, ...o }); } catch {} },
        remove: (n, o) => { try { c.set({ name: n, value: "", ...o }); } catch {} },
      },
    }
  );
}

export async function GET(req: NextRequest) {
  const db = supa();
  const url = new URL(req.url);

  const redirect = url.searchParams.get("redirect") || "/";
  const access_token = url.searchParams.get("access_token");
  const refresh_token = url.searchParams.get("refresh_token");
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as any;
  const email = url.searchParams.get("email") || undefined;

  try {
    if (access_token && refresh_token) {
      await db.auth.setSession({ access_token, refresh_token });
    } else if (code) {
      // @ts-ignore: distintas versiones aceptan string
      await db.auth.exchangeCodeForSession(code);
    } else if (token_hash && type && email) {
      await db.auth.verifyOtp({ token_hash, type, email });
    } else {
      // Intento final (URL completa)
      // @ts-ignore
      await db.auth.exchangeCodeForSession(req.url);
    }
  } catch {}

  return NextResponse.redirect(new URL(redirect, url.origin));
}
