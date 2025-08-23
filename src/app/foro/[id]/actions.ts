// app/foro/[id]/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type Resp = { ok: true } | { ok: false; error: string }

export async function addThreadComment(formData: FormData): Promise<Resp> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no-auth' }

  const threadId = String(formData.get('thread_id') || '')
  const content = String(formData.get('content') || '').trim()
  if (!threadId) return { ok: false, error: 'thread-required' }
  if (!content) return { ok: false, error: 'content-required' }

  const payload: Record<string, any> = {
    thread_id: threadId,
    author_id: user.id,
    content,
    created_at: new Date().toISOString(),
  }

  // Inserta en thread_comments (con FK a profiles)
  const { error } = await supabase.from('thread_comments').insert(payload)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/foro/${threadId}`)
  return { ok: true }
}
