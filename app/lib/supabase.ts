
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso general (mantener para compatibilidad)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para el servidor - se importa dinámicamente donde se necesite
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  })
}

// Cliente para el navegador con localStorage y configuración optimizada
export function createBrowserSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-auth-token',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'hablando-de-caballos@1.0.0'
      }
    }
  })
}
