// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options: CookieOptions) => cookieStore.set({ name, value, ...options }),
        remove: (name, options: CookieOptions) => cookieStore.set({ name, value: "", ...options }),
      },
    }
  );
}
export const createSupabaseServerClient = supabaseServer;
export const createSupabaseServer = supabaseServer;
export const createClient = supabaseServer;

export function createSupabaseServerClientReadOnly() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );
}
export default supabaseServer;
