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
export async function addHallComment(formData: FormData) {
  const profileId = String(formData.get('profileId') || '')
  const slug = String(formData.get('slug') || '')
  const content = String(formData.get('content') || '').trim()

  if (!profileId) return { ok: false, error: 'Perfil inválido.' }
  if (!content) return { ok: false, error: 'Escribe un comentario.' }

  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Debes iniciar sesión.' }

  // RLS exige author_id = auth.uid()
  const ins = await supabase.from('hall_comments').insert({
    profile_id: profileId,
    author_id: user.id,
    content,
  })
  if (ins.error) return { ok: false, error: ins.error.message }

  if (slug) revalidatePath(`/hall/${slug}`)
  return { ok: true }
}

/** Alternar voto (agregar / quitar) y devolver estado + conteo */
export async function toggleVote(profileId: string, slug?: string) {
  if (!profileId) return { ok: false, error: 'Perfil inválido.' }

  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Debes iniciar sesión.' }

  // ¿ya existe el voto?
  const { data: existing } = await supabase
    .from('hall_votes')
    .select('profile_id')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const del = await supabase
      .from('hall_votes')
      .delete()
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
    if (del.error) return { ok: false, error: del.error.message }
  } else {
    const ins = await supabase
      .from('hall_votes')
      .insert({ profile_id: profileId, user_id: user.id })
    if (ins.error) return { ok: false, error: ins.error.message }
  }

  // leer conteo actualizado (trigger ya lo ajusta)
  const { data: profile } = await supabase
    .from('hall_profiles')
    .select('votes_count')
    .eq('id', profileId)
    .maybeSingle()

  if (slug) revalidatePath(`/hall/${slug}`)
  return {
    ok: true,
    voted: !existing,
    count: profile?.votes_count ?? 0,
  }
}
