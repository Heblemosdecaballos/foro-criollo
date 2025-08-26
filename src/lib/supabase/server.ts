// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookieList: { name: string; value: string; options: CookieOptions }[]) {
          cookieList.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
    }
  );
}

/** Compatibilidad con código antiguo (mismo objeto, distinto nombre) */
export const createSupabaseServer = supabaseServer;

/** Por si en algún sitio importaste default */
export default supabaseServer;
