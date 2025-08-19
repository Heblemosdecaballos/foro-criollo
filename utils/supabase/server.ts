// utils/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

function defaultCookieOptions(): Partial<CookieOptions> {
  const isProd = process.env.NODE_ENV === 'production'
  const domain =
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.hablandodecaballos.com'

  return {
    path: '/',
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd ? true : false,
    domain: isProd ? domain : undefined,
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
    }
  )
}

/* ---------- Alias de compatibilidad ---------- */
export const supabaseServer = createSupabaseServerClient
export const createRouteHandlerClient = createSupabaseServerClient
export default createSupabaseServerClient
