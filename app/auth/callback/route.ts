// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/utils/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // evitamos cache/edge

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  const supabase = supabaseServer()

  if (code) {
    // crea la sesión y escribe los cookies sb-*
    await supabase.auth.exchangeCodeForSession(code)
  }

  // a dónde lo mandamos después de loguear
  const next = url.searchParams.get('next') ?? '/historias/nueva'
  // forza destino en el APEX
  const dest = new URL(next, 'https://hablandodecaballos.com')

  return NextResponse.redirect(dest, { status: 302 })
}
