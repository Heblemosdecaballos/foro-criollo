import { createClient } from "@supabase/supabase-js";

/** Cliente único de navegador (browser) */
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
);

/**
 * API recomendada en componentes cliente:
 *   import supabaseClient from "@/lib/supabase/client";
 */
export default supabaseClient;

/**
 * ✅ Compatibilidad con código antiguo:
 * - algunos archivos usan `const supabase = supabaseBrowser();`
 * - otros usan `createSupabaseBrowser()` o `createSupabaseBrowserClient()`
 * Todos devuelven el mismo cliente.
 */
export function supabaseBrowser() {
  return supabaseClient;
}
export function createSupabaseBrowser() {
  return supabaseClient;
}
export function createSupabaseBrowserClient() {
  return supabaseClient;
}

/** Export nombrado del objeto, por si lo importan como named import */
export { supabaseClient };
