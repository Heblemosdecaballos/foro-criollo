// app/hall/[slug]/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type VoteResp = { ok: true; voted: boolean; count: number } | { ok: false; error: string }
type CmtResp  = { ok: true } | { ok: false; error: string }

export async function toggleVote(profileId: string): Promise<VoteResp> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no-auth' }

  const { data: existing } = await supabase
    .from('hall_votes')
    .select('profile_id')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('hall_votes')
      .delete()
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await supabase
      .from('hall_votes')
      .insert({ profile_id: profileId, user_id: user.id })
    if (error) return { ok: false, error: error.message }
  }

  const { data: prof } = await supabase
    .from('hall_profiles')
    .select('votes_count, slug')
    .eq('id', profileId)
    .maybeSingle()

  if (!prof) return { ok: false, error: 'not-found' }
  revalidatePath(`/hall/${prof.slug}`)
  return { ok: true, voted: !existing, count: prof.votes_count }
}

export async function addHallComment(formData: FormData): Promise<CmtResp> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no-auth' }

  const profile_id = String(formData.get('profile_id') || '')
  const content = String(formData.get('content') || '').trim()
  if (!profile_id) return { ok: false, error: 'profile-required' }
  if (!content) return { ok: false, error: 'content-required' }

  const { data: prof } = await supabase
    .from('hall_profiles')
    .select('slug')
    .eq('id', profile_id)
    .maybeSingle()
  if (!prof) return { ok: false, error: 'not-found' }

  const { error } = await supabase.from('hall_comments').insert({
    profile_id, content, author_id: user.id
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/hall/${prof.slug}`)
  return { ok: true }
}
