import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await supa.rpc('increment_views', { thread_id: params.id })
  return NextResponse.json({ ok: true })
}
