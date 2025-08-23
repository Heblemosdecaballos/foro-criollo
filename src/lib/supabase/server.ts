// /src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Cliente de Supabase para componentes/acciones del servidor.
 * Funciona con cualquier versión de @supabase/ssr gracias al cast final.
 */
export function supabaseServer() {
  const store = cookies();

  const cookieMethods = {
    get(name: string) {
      return store.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        // En Server Components next/headers solo expone set() (no delete).
        store.set({ name, value, ...options });
      } catch {
        /* no-op en edge/SSR sin mutación de cookies */
      }
    },
    remove(name: string, options: CookieOptions) {
      try {
        // Remover en Next Server se hace como set con value vacío.
        store.set({ name, value: "", ...options });
      } catch {
        /* no-op */
      }
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Cast para evitar incompatibilidades de tipos entre versiones.
      cookies: cookieMethods as any,
    }
  );
}
