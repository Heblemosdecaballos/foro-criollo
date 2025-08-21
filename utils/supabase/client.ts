// /utils/supabase/client.ts
import { createClient as createJsClient } from "@supabase/supabase-js";

export function createSupabaseBrowserClient() {
  return createJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Alias posibles en tu repo */
export const createSupabaseClient = createSupabaseBrowserClient;
export const createSupabaseBrowserClientReadOnly = createSupabaseBrowserClient;
