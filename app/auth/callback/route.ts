// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/'
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin

  if (code) {
    const supabase = supabaseServer()
    // Crea/actualiza los cookies sb-… en esta respuesta
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirige a donde venía el usuario (o a /)
  return NextResponse.redirect(`${origin}${next}`)
}
