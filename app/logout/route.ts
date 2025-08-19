// app/logout/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/utils/supabase/server'

export async function POST() {
  const supabase = supabaseServer()
  await supabase.auth.signOut()

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://hablandodecaballos.com'
  return NextResponse.redirect(`${origin}/`)
}
