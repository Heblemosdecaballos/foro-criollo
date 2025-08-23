// src/lib/supabase/server.ts
// Cliente de Supabase para Next App Router (Server Components / Server Actions).
// Incluye los exports que tu proyecto espera: `supabaseServer`,
// `createSupabaseServerClient`, `createSupabaseServerClientReadOnly` y `createClient`.

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Cliente de lectura/escritura (mantiene la sesión actualizando cookies).
 * Uso común en Server Actions.
 */
export function supabaseServer() {
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

/**
 * Alias explícito (muchos archivos lo usan con este nombre).
 */
export const createSupabaseServerClient = supabaseServer;

/**
 * Variante SOLO LECTURA: no modifica cookies/sesión.
 * Útil para lecturas donde no quieres mutar la respuesta.
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
        // No-ops para no tocar la sesión
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  );
}

/**
 * Compatibilidad adicional: algunos módulos importan `createClient`.
 */
export const createClient = supabaseServer;

// Export default opcional por si algún sitio lo usa así.
export default supabaseServer;
