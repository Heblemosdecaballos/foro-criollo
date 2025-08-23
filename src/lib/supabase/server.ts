// /src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Construye un cliente de Supabase para Server Components / acciones del servidor.
 * Compatible con distintas versiones de @supabase/ssr (se usa un cast en cookies).
 */
export function createSupabaseServer() {
  const store = cookies();

  const cookieMethods = {
    get(name: string) {
      return store.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        store.set({ name, value, ...options });
      } catch {
        /* no-op (entornos que no permiten mutar cookies) */
      }
    },
    remove(name: string, options: CookieOptions) {
      try {
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
      cookies: cookieMethods as any, // cast para evitar desajustes de tipos entre versiones
    }
  );
}

/** Alias cómodo si quieres llamarlo como función */
export function supabaseServer() {
  return createSupabaseServer();
}

/** Export default para que los index barrels puedan reexportar `default` */
export default supabaseServer;
