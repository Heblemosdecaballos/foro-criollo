// /lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para el NAVEGADOR
 * (persistencia de sesión habilitada)
 */
export function createSupabaseBrowser() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}

/* ===== Alias para compatibilidad con imports antiguos ===== */
export const createSupabaseBrowserClient = createSupabaseBrowser;
export const createSupabaseClient = createSupabaseBrowser;
export const createSupabaseBrowserClientReadOnly = createSupabaseBrowser;
export const createSupabaseBrowserReadOnly = createSupabaseBrowser;

/**
 * Export default: la FACTORÍA (función), no la instancia,
 * para que puedas usar: `const supa = createSupabaseBrowser()`
 */
export default createSupabaseBrowser;
