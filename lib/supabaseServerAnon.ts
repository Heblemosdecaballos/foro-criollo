// lib/supabaseServerAnon.ts
import { createClient } from '@supabase/supabase-js';

export function getSupabaseServerAnon() {
  // Cliente server-side SIN cookies (solo lecturas públicas con RLS abierto a SELECT)
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
