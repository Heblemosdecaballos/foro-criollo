
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Solo procesar rutas protegidas para reducir complejidad
  const pathname = req.nextUrl.pathname
  const protectedRoutes = ['/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!isProtectedRoute) {
    return res
  }
  
  // Crear cliente básico de Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar admin solo para rutas admin
    if (pathname.startsWith('/admin')) {
      const isAdmin = session.user.email === 'admin@hablandodecaballos.com' || 
                     session.user.email === 'moderator@hablandodecaballos.com'
      
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  } catch (error) {
    console.error('Middleware error:', error)
    // En caso de error, redirigir a login
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}
