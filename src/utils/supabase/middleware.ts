import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function updateSession(req: NextRequest, res: NextResponse) {
  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set(name: string, value: string, opts: CookieOptions) { res.cookies.set({ name, value, ...opts }); },
        remove(name: string, opts: CookieOptions) { res.cookies.set({ name, value: "", ...opts }); },
      } as any,
    }
  );
  await supa.auth.getUser();
}
