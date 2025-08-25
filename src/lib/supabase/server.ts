// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/** Cliente Server estándar (con cookies) */
export function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

/** Aliases para compatibilidad con código existente */
export const createClient = createSupabaseServer;                    // { createClient }
export const supabaseServer = createSupabaseServer;                  // { supabaseServer }
export const createSupabaseServerClient = createSupabaseServer;      // { createSupabaseServerClient }
export const createSupabaseServerClientReadOnly = createSupabaseServer; // { createSupabaseServerClientReadOnly }

/** Default export permitido para `import supabaseServer from ".../server"` */
export default createSupabaseServer;
