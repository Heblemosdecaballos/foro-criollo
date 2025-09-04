
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Crear cliente de Supabase para el middleware
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            return req.cookies.get(key)?.value ?? null
          },
          setItem: (key: string, value: string) => {
            res.cookies.set(key, value, {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7
            })
          },
          removeItem: (key: string) => {
            res.cookies.set(key, '', { maxAge: 0 })
          }
        }
      }
    }
  )

  // Verificar sesión desde las cookies
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    const pathname = req.nextUrl.pathname
    
    // Rutas que requieren autenticación
    const protectedRoutes = ['/admin', '/perfil', '/forums/create', '/hall/nueva']
    const adminRoutes = ['/admin']
    
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute && !session) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isAdminRoute && session) {
      const isAdmin = session.user.email === 'admin@hablandodecaballos.com' || 
                     session.user.email === 'moderator@hablandodecaballos.com'
      
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  } catch (error) {
    console.error('Error en middleware:', error)
  }

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
