// app/hall/[slug]/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

function fileExt(name: string) {
  const p = name.lastIndexOf('.')
  return p === -1 ? '' : name.slice(p + 1)
}

/** Subir foto a la galería del perfil (bucket 'hall') */
export async function addMediaAction(formData: FormData) {
  const profileId = String(formData.get('profileId') || '')
  const slug = String(formData.get('slug') || '')
  const caption = String(formData.get('caption') || '').slice(0, 500)
  const file = formData.get('file') as File | null

  if (!profileId) return { ok: false, error: 'Perfil inválido.' }
  if (!file || file.size === 0) return { ok: false, error: 'Selecciona una imagen.' }

  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Debes iniciar sesión.' }

  const ext = fileExt(file.name) || 'jpg'
  const path = `${profileId}/${randomUUID()}.${ext}`

  // 1) subir a storage
  const up = await supabase.storage.from('hall').upload(path, file, {
    contentType: file.type || 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  })
  if (up.error) return { ok: false, error: up.error.message }

  // 2) url pública
  const { data: pub } = supabase.storage.from('hall').getPublicUrl(path)
  const url = pub.publicUrl

  // 3) registrar en BD
  const ins = await supabase.from('hall_media').insert({
    profile_id: profileId,
    url,
    caption,
    added_by: user.id,
  })
  if (ins.error) return { ok: false, error: ins.error.message }

  if (slug) revalidatePath(`/hall/${slug}`)
  return { ok: true }
}

/** Agregar comentario al perfil del Hall */
export asy
