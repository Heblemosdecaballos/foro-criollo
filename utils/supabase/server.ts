// utils/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Cliente SSR con permisos completos (lee y ESCRIBE cookies).
 * Úsalo SOLO en Server Actions o Route Handlers.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 })
      },
    },
  })
}

/**
 * Cliente SSR SOLO LECTURA (NUNCA escribe cookies).
 * Úsalo en páginas y Server Components.
 */
export function createSupabaseServerClientReadOnly() {
  const cookieStore = cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // No-ops para evitar: "Cookies can only be modified in a Server Action..."
      set() {},
      remove() {},
    },
  })
}

/* Alias de compatibilidad */
export const supabaseServer = createSupabaseServerClient
export const createRouteHandlerClient = createSupabaseServerClient
