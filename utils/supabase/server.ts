// utils/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Atributos comunes para las cookies de sesión (sin `name`).
 * - En producción: SameSite=None y Secure
 * - Dominio apex para compartir subdominios (si aplica)
 */
function serializeOptions(): Partial<CookieOptions> {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    path: '/',
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd ? true : false,
    domain: isProd
      ? (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.hablandodecaballos.com')
      : undefined,
    maxAge: 60 * 60 * 24 * 7, // 7 días (en segundos)
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
          // Para Next.js sí debemos incluir `name` al hacer set
          cookieStore.set({
            name,
            value,
            ...serializeOptions(),
            ...(options ?? {}),
          } as any)
        },
        remove(name: string, options?: CookieOptions) {
          cookieStore.set({
            name,
            value: '',
            ...serializeOptions(),
            ...(options ?? {}),
            maxAge: 0,
          } as any)
        },
      },
      // 👇 Opciones que `@supabase/ssr` usará al emitir Set-Cookie (sin `name`)
      cookieOptions: serializeOptions(),
    }
  )
}

/* ---------- Alias de compatibilidad ---------- */
export const supabaseServer = createSupabaseServerClient
export const createRouteHandlerClient = createSupabaseServerClient
export default createSupabaseServerClient
