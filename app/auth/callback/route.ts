// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient()
  const url = new URL(request.url)

  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  if (code) {
    // Intercambia el code por sesión y deja cookies sb-... válidas
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(next, process.env.NEXT_PUBLIC_SITE_URL))
}
