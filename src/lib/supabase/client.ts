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
 * ✅ Retro-compatibilidad:
 * Algunos componentes hacen `const supabase = supabaseBrowser();`
 * Mantenemos esa API como función que devuelve el cliente.
 */
export function supabaseBrowser() {
  return supabaseClient;
}

/** Exports modernos recomendados */
export { supabaseClient };

/** Default export (también válido: import supabase from "@/lib/supabase/client") */
export default supabaseClient;
