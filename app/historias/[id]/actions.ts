// app/historias/[id]/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type Resp = { ok: true } | { ok: false; error: string }

export async function createStoryCommentAction(storyId: string, formData: FormData): Promise<Resp> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no-auth' }

  const content = String(formData.get('content') || '').trim()
  if (!content) return { ok: false, error: 'content-required' }

  const { error } = await supabase
    .from('story_comments')
    .insert({ story_id: storyId, content, author_id: user.id })

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/historias/${storyId}`)
  return { ok: true }
}
