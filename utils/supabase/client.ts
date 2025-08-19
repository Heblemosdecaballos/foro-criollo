// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente de Supabase para el navegador (CSR).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/* ---------- Compatibilidad de imports ---------- */
export const createClient = createSupabaseBrowserClient
export const createSupabaseBrowser = createSupabaseBrowserClient
export default createSupabaseBrowserClient
