// /src/utils/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para RSC / Server Actions (con cookies).
 * Este nombre es el que usarán el resto de archivos.
 */
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

/* ===== Alias para compatibilidad con cualquier import del proyecto ===== */
export const createSupabaseServerClient = createSupabaseServer;
export const createSupabaseServerClientReadOnly = createSupabaseServer;
export const supabaseServer = createSupabaseServer;
export const createClient = createSupabaseServer; // por si algún archivo importa { createClient } desde aquí

export default createSupabaseServer;
