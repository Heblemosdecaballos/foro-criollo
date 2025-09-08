
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso general (mantener para compatibilidad)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para el servidor - se importa dinámicamente donde se necesite
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      flowType: 'pkce'
    }
  })
}

// Cliente servidor con cookies para obtener sesión de usuario
export async function createServerSupabaseClientWithCookies() {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value
          } catch (error) {
            return undefined
          }
        },
        set(name: string, value: string, options: any) {
          // No-op in server components
        },
        remove(name: string, options: any) {
          // No-op in server components
        }
      },
    })
  } catch (error) {
    // Fallback to regular server client if cookies not available
    return createServerSupabaseClient()
  }
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
