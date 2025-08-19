// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = new URL(req.url)

  // Fuerza apex
  if (url.hostname === 'www.hablandodecaballos.com') {
    url.hostname = 'hablandodecaballos.com'
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

// Evita actuar sobre assets estáticos
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
