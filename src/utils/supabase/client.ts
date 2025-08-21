// /src/utils/supabase/client.ts
import { createClient as createJsClient } from "@supabase/supabase-js";

/** Cliente de Supabase para el NAVEGADOR */
export function createSupabaseBrowserClient() {
  return createJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/* ==== Alias para compatibilidad con imports existentes ==== */
export const createSupabaseClient = createSupabaseBrowserClient;
export const createSupabaseBrowser = createSupabaseBrowserClient;
export const createSupabaseBrowserClientReadOnly = createSupabaseBrowserClient;
export const createSupabaseBrowserReadOnly = createSupabaseBrowserClient;
