// utils/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options?: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options?: any) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    }
  )
}

/* ---------- Capa de compatibilidad ---------- */
// Si en tu código antiguo tienes:
// import { supabaseServer } from '@/utils/supabase/server'
// import { createRouteHandlerClient } from '@supabase/ssr' (o similar)
//
// Esto lo mantiene vivo sin tocar nada.
export const supabaseServer = createSupabaseServerClient
export const createRouteHandlerClient = createSupabaseServerClient
