// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function getSupabaseServer() {
  const cookieStore = cookies();
  const access = cookieStore.get('sb-access-token')?.value ?? null;
  // Nota: no necesitamos el refresh aquí; las rutas son de vida corta
  // const refresh = cookieStore.get('sb-refresh-token')?.value ?? null;

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Pasamos el JWT de la sesión actual para que RLS y auth funcionen
        headers: access ? { Authorization: `Bearer ${access}` } : {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  return client;
}
