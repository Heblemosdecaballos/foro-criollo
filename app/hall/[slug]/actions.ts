// app/hall/[slug]/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

function extOf(name: string) {
  const p = name.lastIndexOf('.')
  return p === -1 ? '' : name.slice(p + 1)
}

/**
 * Subir IMAGEN a la galería del perfil (bucket: hall)
 * FormData esperado:
 *  - profileId (string)
 *  - slug (string) para revalidar /hall/[slug]
 *  - file (File)
 *  - caption (string, opcional)
 */
export async function addMediaAction(formData: FormData) {
  const profileId = String(formData.get('profileId') || '')
  const slug = String(formData.get('slug') || '')
  const file = formData.get('file') as File | null
  const caption = String(formData.get('caption') || '').slice(0, 500)

  if (!profileId) return { ok: false, error: 'Perfil inválido.' }
  if (!file || file.size === 0) return { ok: false, error: 'Selecciona una imagen.' }

  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Debes iniciar sesión.' }

  const ext = extOf(file.name) || 'jpg'
  const path = `media/${profileId}/${randomUUID()}.${ext}`
  const buffer = await file.arrayBuffer()

  const upload = await supabase.storage.from('hall').upload(path, buffer, {
    contentType: file.type || 'image/jpeg',
    cacheControl: '3600',
  })
  if (upload.error) return { ok: false, error: upload.error.message }

  const { data: pub } = supabase.storage.from('hall').getPublicUrl(path)
  const url = pub.publicUrl

  const ins = await supabase.from('hall_media').insert({
    profile_id: profileId,
    kind: 'image',
    url,
    caption,
    added_by: user.id,
  })
  if (ins.error) return { ok: false, error: ins.error.message }

  if (slug) revalidatePath(`/hall/${slug}`)
  return { ok: true, url }
}

/**
 * Agregar VIDEO de YouTube a la galería del perfil
 * FormData:
 *  - profileId (string)
 *  - slug (string)
 *  - url (string) URL de YouTube
 */
export async function addYoutubeAction(formData: FormData) {
  const profileId = String(formData.get('profileId') || '')
  const slug = String(formData.get('slug') || '')
  const url = String(formData.get('url') || '').trim()

  if (!profileId) return { ok: false, error: 'Perfil inválido.' }
  if (!url) return { ok: false, error: 'Ingresa una URL de YouTube.' }

  const m =
    url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
    url.match(/[?&]v=([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/)
  const youtubeId = m?.[1]
  if (!youtubeId) return { ok: false, error: 'URL de YouTube inválida.' }

  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Debes iniciar sesión.' }

  const ins = await supabase.from('hall_media').insert({
    profile_id: profileId,
    kind: 'youtube',
    url,
    youtube_id: youtubeId,
    added_by: user.id,
  })
  if (ins.error) return { ok: false, error: ins.error.message }

  if (slug) revalidatePath(`/hall/${slug}`)
  return { ok: true }
}

/**
 * Agregar COMENTARIO
 * FormData:
 *  - profileId (string)
 *  - slug (string)
 *  - content (string)
 */
export async function addHallComment(formData: FormData) {
  const profileId = String(formData.get('profileId') || '')
  const slug = String(formData.get('slug') || '')
  const content = String(formData.get('content') || '').trim()

  if (!profileId) return { ok: false, error: 'Perfil inválido.' }
  if (!content) return { ok: false, error: 'Escribe un comentario.' }

  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Debes iniciar sesión.' }

  const ins = await supabase.from('hall_comments').insert({
    profile_id: profileId,
    author_id: user.id,
    content,
  })
  if (ins.error) return { ok: false, error: ins.error.message }

  if (slug) revalidatePath(`/hall/${slug}`)
  return { ok: true }
}

/**
 * Alternar VOTO (insert/delete en hall_votes)
 * FormData:
 *  - profileId (string)
 *  - slug (string)
 */
export async function toggleVote(formData: FormData) {
  const profileId = String(formData.get('profileId') || '')
  const slug = String(formData.get('slug') || '')
  if (!profileId) return { ok: false, error: 'Perfil inválido.' }

  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Debes iniciar sesión.' }

  const { data: exists } = await supabase
    .from('hall_votes')
    .select('profile_id')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle()

  let voted: boolean
  if (exists) {
    await supabase
      .from('hall_votes')
      .delete()
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
    voted = false
  } else {
    const ins = await supabase.from('hall_votes').insert({
      profile_id: profileId,
      user_id: user.id,
    })
    if (ins.error) return { ok: false, error: ins.error.message }
    voted = true
  }

  const { data: prof } = await supabase
    .from('hall_profiles')
    .select('votes_count')
    .eq('id', profileId)
    .single()
  const count = prof?.votes_count ?? 0

  if (slug) revalidatePath(`/hall/${slug}`)
  return { ok: true, voted, count }
}
