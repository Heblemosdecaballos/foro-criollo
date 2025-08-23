// src/utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para usar en componentes "use client".
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Alias para compatibilidad con código existente:
 * Permite importar { createSupabaseBrowser } desde "@/utils/supabase/client"
 */
export const createSupabaseBrowser = createSupabaseBrowserClient;

export default createSupabaseBrowserClient;
