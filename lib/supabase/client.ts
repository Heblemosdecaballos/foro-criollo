// /lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

/** Cliente de Supabase para el navegador (persistiendo sesión) */
export function createSupabaseBrowser() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
}

/** Instancia única por módulo (útil para hooks/SSR cliente) */
const supabase = createSupabaseBrowser();
export default supabase;

/** Alias habituales para compatibilidad con imports antiguos */
export const createSupabaseClient = createSupabaseBrowser;
export const supabaseClient = supabase;
export const createClientBrowser = createSupabaseBrowser;
