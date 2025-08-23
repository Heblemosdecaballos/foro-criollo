// src/lib/supabase/server.ts
// Cliente de Supabase para Next App Router (Server Components / Server Actions).
// Exporta: supabaseServer, createSupabaseServer, createSupabaseServerClient,
// createSupabaseServerClientReadOnly, createClient (alias) y default.

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Cliente lectura/escritura (actualiza cookies de sesión).
 */
export function supabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ⚠️ Cast a `any` para tolerar cambios menores de tipos entre versiones.
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
      } as any,
    }
  );
}

/** Aliases comunes en el proyecto */
export const createSupabaseServerClient = supabaseServer;
export const createSupabaseServer = supabaseServer;
export const createClient = supabaseServer;

/**
 * Cliente SOLO LECTURA (no modifica cookies).
 */
export function createSupabaseServerClientReadOnly() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ⚠️ Cast a `any` para tolerar cambios menores de tipos entre versiones.
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // No-ops: no tocar la sesión ni las cookies en respuestas.
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      } as any,
    }
  );
}

/** Default export por si algún módulo lo usa de esta forma */
export default supabaseServer;
