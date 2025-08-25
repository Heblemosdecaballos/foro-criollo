// src/lib/supabase/client.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Crea el cliente de Supabase para el navegador */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Alias por compatibilidad */
export const createSupabaseBrowserClient = createSupabaseBrowser;
/** Alias corto (el que veníamos usando) */
export const supabaseBrowser = createSupabaseBrowser;

/** Default export para que el barrel pueda re-exportar `default` */
export default createSupabaseBrowser;
