// app/api/threads/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('threads')
    .select('id,title,slug,created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
