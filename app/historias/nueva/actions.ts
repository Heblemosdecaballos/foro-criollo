'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/utils/supabase/server'

type InsertResult = { ok?: true; slug?: string; id?: string; error?: string }

async function tryInsertVariants(
  table: string,
  base: Record<string, any>,
  content: string
): Promise<InsertResult> {
  const supabase = createSupabaseServerClient()

  // 1) content
  {
    const { data, error } = await supabase.from(table)
      .insert({ ...base, content })
      .select('id, slug')
      .single()
    if (!error && data) return { ok: true, slug: data.slug ?? data.id, id: data.id }
    // Solo seguimos probando si el error sugiere columna inexistente
    if (!String(error?.message || '').toLowerCase().includes('content')) {
      return { error: error?.message || 'insert-failed' }
    }
  }

  // 2) body
  {
    const { data, error } = await supabase.from(table)
      .insert({ ...base, body: content })
      .select('id, slug')
      .single()
    if (!error && data) return { ok: true, slug: data.slug ?? data.id, id: data.id }
    if (!String(error?.message || '').toLowerCase().includes('body')) {
      return { error: error?.message || 'insert-failed' }
    }
  }

  // 3) text
  {
    const { data, error } = await supabase.from(table)
      .insert({ ...base, text: content })
      .select('id, slug')
      .single()
    if (!error && data) return { ok: true, slug: data.slug ?? data.id, id: data.id }
    if (!String(error?.message || '').toLowerCase().includes('text')) {
      return { error: error?.message || 'insert-failed' }
    }
  }

  // 4) description
  {
    const { data, error } = await supabase.from(table)
      .insert({ ...base, description: content })
      .select('id, slug')
      .single()
    if (!error && data) return { ok: true, slug: data.slug ?? data.id, id: data.id }
    if (!String(error?.message || '').toLowerCase().includes('description')) {
      return { error: error?.message || 'insert-failed' }
    }
  }

  // 5) Sin contenido (si la tabla lo permite)
  {
    const { data, error } = await supabase.from(table)
      .insert({ ...base })
      .select('id, slug')
      .single()
    if (!error && data) return { ok: true, slug: data.slug ?? data.id, id: data.id }
    return { error: error?.message || 'insert-failed' }
  }
}

export async function createStoryAction(formData: FormData) {
  const supabase = createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'no-auth' }

  const title = String(formData.get('title') || '').trim()
  const content = String(formData.get('content') || '').trim()
  if (!title) return { error: 'title-required' }

  const base = {
    title,
    author_id: user.id,
    created_at: new Date().toISOString(),
  }

  // 1) Intentar en STORIES con variantes
  const rStories = await tryInsertVariants('stories', base, content)
  if (rStories.ok) {
    revalidatePath('/')
    return rStories
  }

  // 2) Intentar en POSTS con variantes
  const rPosts = await tryInsertVariants('posts', base, content)
  if (rPosts.ok) {
    revalidatePath('/')
    return rPosts
  }

  // Si nada funcionó, devolvemos el error más informativo
  return { error: rStories.error || rPosts.error || 'insert-failed' }
}
