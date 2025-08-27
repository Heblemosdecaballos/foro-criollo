import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

export default supabaseClient;
export { supabaseClient };
export function supabaseBrowser() { return supabaseClient; }
export function createSupabaseBrowser() { return supabaseClient; }
export function createSupabaseBrowserClient() { return supabaseClient; }
