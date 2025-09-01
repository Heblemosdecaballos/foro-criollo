import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseServer() {
  // Verificar que las variables de entorno estén configuradas correctamente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Si las credenciales son de demo/placeholder, lanzar error controlado
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl.includes('demo-project') || 
      supabaseUrl.includes('example') ||
      supabaseAnonKey.includes('demo-key') ||
      supabaseAnonKey.includes('placeholder')) {
    throw new Error('Supabase credentials not properly configured for production');
  }

  const cookieStore = cookies();
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookieList: { name: string; value: string; options: CookieOptions }[]) {
          cookieList.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
    }
  );
}

/** Compat para código viejo */
export const createSupabaseServer = supabaseServer;
export default supabaseServer;
