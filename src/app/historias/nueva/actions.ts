'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/utils/supabase/server'

type ActionResponse =
  | { ok: true; id: string }
  | { ok: false; error: string }

export async function createStoryAction(formData: FormData): Promise<ActionResponse> {
  const supabase = createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no-auth' }

  const title = String(formData.get('title') || '').trim()
  const content = String(formData.get('content') || '').trim()
  if (!title) return { ok: false, error: 'title-required' }

  const base = {
    title,
    author_id: user.id,
    created_at: new Date().toISOString(),
  }

  const tables = ['stories', 'posts'] as const
  const contentFields = ['content', 'body', 'text', 'description', ''] as const

  for (const table of tables) {
    for (const field of contentFields) {
      const payload: Record<string, any> = { ...base }
      if (field) payload[field] = content

      // Solo seleccionamos 'id' (no dependemos de 'slug')
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select('id')
        .single()

      if (!error && data?.id) {
        revalidatePath('/')
        return { ok: true, id: data.id }
      }

      const msg = String(error?.message || '').toLowerCase()
      if (field && (msg.includes('does not exist') || msg.includes('schema'))) {
        continue
      }
      break
    }
  }

  return { ok: false, error: 'insert-failed' }
}
