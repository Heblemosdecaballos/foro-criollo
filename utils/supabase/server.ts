// utils/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export function supabaseServer() {
  const cookieStore = cookies()

  // usa tu apex; puedes moverlo a un env var
  const cookieDomain =
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.hablandodecaballos.com'

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value,
            ...options,
            path: '/',
            sameSite: 'lax',
            secure: true,
            domain: cookieDomain,
          })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value: '',
            ...options,
            path: '/',
            maxAge: 0,
            expires: new Date(0),
            domain: cookieDomain,
          })
        },
      },
    }
  )
}
