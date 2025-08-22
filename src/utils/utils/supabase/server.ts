// /utils/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Cliente Supabase para RSC/Server Actions (con cookies) */
export function createClient() {
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

/* Alias comunes en proyectos existentes */
export const createSupabaseServerClient = createClient;
export const createSupabaseServerClientReadOnly = createClient;
export const createSupabaseServer = createClient;
