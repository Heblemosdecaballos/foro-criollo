'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/utils/supabase/server'

type Result =
  | { ok: true; id: string }
  | { error: string }

export async function createStoryAction(formData: FormData): Promise<Result> {
  const supabase = createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'no-auth' }

  const title = String(formData.get('title') || '').trim()
  const content = String(formData.get('content') || '').trim()
  if (!title) return { error: 'title-required' }

  const base = {
    title,
    author_id: user.id,
    created_at: new Date().toISOString(),
  }

  // probamos primero en 'stories' y luego en 'posts'
  const tables = ['stories', 'posts'] as const
  // distintos nombres de columna para el contenido
  const contentFields = ['content', 'body', 'text', 'description', ''] as const

  for (const table of tables) {
    for (const field of contentFields) {
      const payload: Record<string, any> = { ...base }
      if (field) payload[field] = content

      // ⚠️ Importante: solo seleccionamos 'id' para no depender de 'slug'
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select('id')
        .single()

      if (!error && data?.id) {
        revalidatePath('/') // refresca home/listados
        return { ok: true, id: data.id }
      }

      // si el error es "columna X no existe", intentamos con el siguiente nombre
      const msg = String(error?.message || '').toLowerCase()
      if (field && (msg.includes('does not exist') || msg.includes('schema'))) {
        continue
      }

      // otro tipo de error: pasamos a la siguiente tabla
      break
    }
  }

  return { error: 'insert-failed' }
}
