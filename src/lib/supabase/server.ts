// /src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Cliente Supabase para RSC/Server Actions (con cookies) */
export function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

/* ===== Alias para cubrir TODOS los imports posibles ===== */
export const createSupabaseServerClient = createSupabaseServer;
export const createSupabaseServerClientReadOnly = createSupabaseServer;
export const supabaseServer = createSupabaseServer;
export const createClient = createSupabaseServer; // por si importan { createClient } de aquí

export default createSupabaseServer;
