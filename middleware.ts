// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const CANONICAL_HOST = 'hablandodecaballos.com'

// Rutas que quieres proteger (empiezan por…)
const PROTECTED_PATHS = [
  '/historias/nueva',
  '/foro/publicar',
  // añade aquí otras rutas privadas…
]

export async function middleware(req: NextRequest) {
  // 1) Canonicaliza www → apex (opcional pero MUY recomendado)
  const host = req.headers.get('host') || ''
  if (host.startsWith('www.')) {
    const url = new URL(req.url)
    url.hostname = CANONICAL_HOST
    return NextResponse.redirect(url, 308)
  }

  // 2) Crea respuesta mutable
  const res = NextResponse.next()

  // 3) Supabase SSR con adaptación de cookies para middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options?: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options?: any) {
          res.cookies.set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    }
  )

  // 4) Si la ruta actual está en la lista de protegidas y no hay user → login
  const pathname = req.nextUrl.pathname
  const needsAuth = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  if (needsAuth) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('next', pathname + req.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 5) Deja pasar
  return res
}

export const config = {
  // Aplica a todo menos estáticos, etc.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
