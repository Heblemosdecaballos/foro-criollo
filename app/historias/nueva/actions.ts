// app/historias/nueva/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export async function createStoryAction(formData: FormData) {
  const supabase = createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'no-auth' }

  const title = String(formData.get('title') || '').trim()
  const content = String(formData.get('content') || '').trim()
  if (!title) return { error: 'title-required' }

  const now = new Date().toISOString()
  const payload = { title, content, author_id: user.id, created_at: now }

  // Intento 1: tabla "stories"
  const r1 = await supabase.from('stories').insert(payload).select('id,slug').single()
  if (!r1.error && r1.data) {
    revalidatePath('/')
    return { ok: true, slug: r1.data.slug ?? r1.data.id }
  }

  // Intento 2 (fallback): tabla "posts"
  const r2 = await supabase.from('posts').insert(payload).select('id,slug').single()
  if (!r2.error && r2.data) {
    revalidatePath('/')
    return { ok: true, slug: r2.data.slug ?? r2.data.id }
  }

  return { error: r1.error?.message || r2.error?.message || 'insert-failed' }
}
