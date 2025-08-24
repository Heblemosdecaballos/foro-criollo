import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const to = next && next.startsWith("/") ? next : "/";

  if (code) {
    const store = cookies();
    const supa = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return store.get(name)?.value; },
          set(name: string, value: string, opts: CookieOptions) { store.set({ name, value, ...opts }); },
          remove(name: string, opts: CookieOptions) { store.set({ name, value: "", ...opts }); },
        } as any,
      }
    );
    await supa.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(to, url.origin));
}
