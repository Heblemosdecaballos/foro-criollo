// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const CANONICAL_HOST = 'hablandodecaballos.com'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  if (host.startsWith('www.')) {
    const url = new URL(req.url)
    url.hostname = CANONICAL_HOST
    return NextResponse.redirect(url, 308)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
