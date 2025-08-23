import { createSupabaseServerClient } from '@/utils/supabase/server'

export async function POST() {
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()
  return new Response(null, { status: 204 })
}
