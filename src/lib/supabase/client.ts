import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
);

/** Compatibilidad con código antiguo que importaba { supabaseBrowser } */
export const supabaseBrowser = supabaseClient;

/** Default export para imports por defecto */
export default supabaseClient;
