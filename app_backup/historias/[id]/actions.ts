// app/historias/[id]/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type Resp = { ok: true } | { ok: false; error: string }

export async function addStoryComment(formData: FormData): Promise<Resp> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no-auth' }

  const storyId = String(formData.get('story_id') || '')
  const content = String(formData.get('content') || '').trim()
  if (!storyId) return { ok: false, error: 'story-required' }
  if (!content) return { ok: false, error: 'content-required' }

  const payload: Record<string, any> = {
    story_id: storyId,
    author_id: user.id,
    content,
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('story_comments').insert(payload)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/historias/${storyId}`)
  return { ok: true }
}
