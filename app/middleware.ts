
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  console.log(`[Middleware] Procesando ruta: ${req.nextUrl.pathname}`)
  
  // Crear cliente de Supabase para el middleware
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            const value = req.cookies.get(key)?.value ?? null
            console.log(`[Middleware] Getting cookie ${key}:`, value ? 'EXISTS' : 'MISSING')
            return value
          },
          setItem: (key: string, value: string) => {
            console.log(`[Middleware] Setting cookie ${key}`)
            res.cookies.set(key, value, {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7,
              path: '/'
            })
          },
          removeItem: (key: string) => {
            console.log(`[Middleware] Removing cookie ${key}`)
            res.cookies.set(key, '', { 
              maxAge: 0,
              path: '/' 
            })
          }
        }
      }
    }
  )

  // Verificar sesión desde las cookies
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log(`[Middleware] Session check:`, {
      hasSession: !!session,
      user: session?.user?.email || 'none',
      error: error?.message || 'none'
    })
    
    const pathname = req.nextUrl.pathname
    
    // Rutas que requieren autenticación
    const protectedRoutes = ['/admin', '/perfil', '/forums/create', '/hall/nueva']
    const adminRoutes = ['/admin']
    
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    console.log(`[Middleware] Route analysis:`, {
      pathname,
      isProtectedRoute,
      isAdminRoute,
      hasSession: !!session
    })

    if (isProtectedRoute && !session) {
      console.log(`[Middleware] Redirecting to login - no session for protected route`)
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isAdminRoute && session) {
      const isAdmin = session.user.email === 'admin@hablandodecaballos.com' || 
                     session.user.email === 'moderator@hablandodecaballos.com'
      
      console.log(`[Middleware] Admin check:`, {
        email: session.user.email,
        isAdmin
      })
      
      if (!isAdmin) {
        console.log(`[Middleware] Redirecting to home - not admin`)
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  } catch (error) {
    console.error('[Middleware] Error:', error)
    // En caso de error, permitir continuar pero logear
  }

  console.log(`[Middleware] Allowing request to continue`)
  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/perfil/:path*',
    '/forums/create',
    '/hall/nueva'
  ]
}
