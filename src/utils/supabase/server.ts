// src/utils/supabase/server.ts
// Adaptador compatible con los imports existentes del proyecto.
// Expone clientes "read/write" y "read-only" para Supabase en el App Router.

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Cliente de Supabase para uso en Server Components / Server Actions.
 * Lee y ACTUALIZA cookies de sesión (read/write).
 */
export function createSupabaseServerClient() {
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
          // Actualiza las cookies en la respuesta (persistencia de sesión)
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

/**
 * Cliente de Supabase de SOLO LECTURA (no muta cookies).
 * Útil cuando quieres consultar datos sin tocar la sesión.
 */
export function createSupabaseServerClientReadOnly() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // No-ops para no modificar cookies:
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  );
}

// Compatibilidad: muchos archivos usan "createClient". Lo exponemos también.
export const createClient = createSupabaseServerClient;

// Export default opcional (por si algún archivo usa default import)
export default createSupabaseServerClient;
