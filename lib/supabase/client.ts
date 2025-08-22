// /lib/supabase/client.ts
import { createClient as createJsClient } from "@supabase/supabase-js";

/** Cliente Supabase para el NAVEGADOR */
export function createSupabaseBrowser() {
  return createJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/* ===== Alias para cubrir TODOS los imports posibles ===== */
export const createSupabaseBrowserClient = createSupabaseBrowser;
export const createSupabaseClient = createSupabaseBrowser;
export const createSupabaseBrowserClientReadOnly = createSupabaseBrowser;
export const createSupabaseBrowserReadOnly = createSupabaseBrowser;

export default createSupabaseBrowser;
