// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente de Supabase para el navegador (CSR).
 * Lee las claves públicas desde variables NEXT_PUBLIC_*.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/* ---------- Compatibilidad de imports (no rompas nada existente) ---------- */
// Puedes importar cualquiera de estos nombres desde "@/utils/supabase/client"
export const createClient = createSupabaseBrowserClient
export const createSupabaseBrowser = createSupabaseBrowserClient
export default createSupabaseBrowserClient
