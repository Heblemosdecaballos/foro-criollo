// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APEX = 'hablandodecaballos.com'

export function middleware(req: NextRequest) {
  const url = new URL(req.url)
  const host = url.hostname
  const isProd = process.env.VERCEL_ENV === 'production'

  if (isProd) {
    // www → apex
    if (host === `www.${APEX}`) {
      url.hostname = APEX
      return NextResponse.redirect(url, 308)
    }
    // CUALQUIER subdominio vercel.app → apex (evita despliegues viejos)
    if (host.endsWith('.vercel.app')) {
      url.hostname = APEX
      return NextResponse.redirect(url, 308)
    }
  }

  return NextResponse.next()
}

// No interceptar assets estáticos
export const config = { matcher: ['/((?!_next|.*\\..*).*)'] }
