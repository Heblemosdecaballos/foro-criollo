// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''

  // 1) forzar quitar www.
  if (host.startsWith('www.')) {
    return NextResponse.redirect(
      new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${host.slice(4)}`),
      308
    )
  }

  // 2) forzar salir de *.vercel.app al apex (evita cookies en vercel.app)
  if (host.endsWith('.vercel.app')) {
    return NextResponse.redirect(
      new URL(req.nextUrl.pathname + req.nextUrl.search, 'https://hablandodecaballos.com'),
      308
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|apple-touch-icon.png).*)',
  ],
}
