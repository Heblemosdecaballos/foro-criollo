// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/'

  if (code) {
    const supabase = createSupabaseServerClient()
    // Intercambia el code por la sesión y ESCRIBE las cookies sb-*
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // Si algo falla, devuélveme a /auth con el error
      const back = new URL(`/auth?error=${encodeURIComponent(error.message)}`, url.origin)
      return NextResponse.redirect(back)
    }
  }

  // Redirige a donde nos pidieron volver (por defecto /)
  const redirectTo = new URL(next, process.env.NEXT_PUBLIC_SITE_URL || 'https://hablandodecaballos.com')
  return NextResponse.redirect(redirectTo)
}
