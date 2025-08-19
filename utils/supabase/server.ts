// utils/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

function defaultCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    name: 'sb',                // prefijo por defecto de Supabase
    path: '/',
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd ? true : false,
    // Dominio apex para compartir subdominios si los usas:
    domain: isProd
      ? (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.hablandodecaballos.com')
      : undefined,
    maxAge: 60 * 60 * 24 * 7,  // 7 días
  }
}

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
        set(name: string, value: string, options?: CookieOptions) {
          cookieStore.set({
            name,
            value,
            ...defaultCookieOptions(),
            ...(options ?? {}),
          })
        },
        remove(name: string, options?: CookieOptions) {
          cookieStore.set({
            name,
            value: '',
            ...defaultCookieOptions(),
            ...(options ?? {}),
            maxAge: 0,
          })
        },
      },
      // 👇 muy importante: aplica atributos en todos los Set-Cookie de Supabase
      cookieOptions: defaultCookieOptions(),
    }
  )
}

/* ---------- Alias de compatibilidad ---------- */
export const supabaseServer = createSupabaseServerClient
export const createRouteHandlerClient = createSupabaseServerClient
export default createSupabaseServerClient
