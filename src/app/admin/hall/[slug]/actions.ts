// app/admin/hall/[slug]/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('no-auth')

  const { data: me } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()

  if (!me?.is_admin) throw new Error('no-admin')
  return { supabase, user }
}

export async function updateProfile(formData: FormData) {
  const { supabase } = await requireAdmin()
  const profileId = String(formData.get('profileId') || '')
  const title = String(formData.get('title') || '')
  const year = formData.get('year') ? Number(formData.get('year')) : null
  const gait = String(formData.get('gait') || '')
  const status = String(formData.get('status') || '')

  await supabase
    .from('hall_profiles')
    .update({ title, year, gait, status })
    .eq('id', profileId)

  // revalida admin y público
  const { data: p } = await supabase.from('hall_profiles').select('slug').eq('id', profileId).single()
  revalidatePath(`/admin/hall/${p?.slug}`)
  revalidatePath(`/hall/${p?.slug}`)
}

export async function uploadCover(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const profileId = String(formData.get('profileId') || '')
  const file = formData.get('cover') as File | null
  if (!file || file.size === 0) return

  const ext = file.name.split('.').pop()
  const path = `profiles/${profileId}/cover/${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage.from('hall').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'image/*',
  })
  if (upErr) throw upErr

  const { data: pub } = await supabase.storage.from('hall').getPublicUrl(path)
  const image_url = pub?.publicUrl

  await supabase.from('hall_profiles').update({ image_url }).eq('id', profileId)

  const { data: p } = await supabase.from('hall_profiles').select('slug').eq('id', profileId).single()
  revalidatePath(`/admin/hall/${p?.slug}`)
  revalidatePath(`/hall/${p?.slug}`)
}

export async function addMediaAdmin(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const profileId = String(formData.get('profileId') || '')
  const caption = String(formData.get('caption') || '')
  const youtube_id = String(formData.get('youtube_id') || '')
  const file = formData.get('file') as File | null

  let kind: 'image' | 'youtube' = 'image'
  let url: string | null = null

  if (youtube_id) {
    kind = 'youtube'
  } else if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const path = `profiles/${profileId}/media/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage.from('hall').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/*',
    })
    if (upErr) throw upErr

    const { data: pub } = await supabase.storage.from('hall').getPublicUrl(path)
    url = pub?.publicUrl ?? null
  } else {
    return
  }

  await supabase.from('hall_media').insert({
    profile_id: profileId,
    kind,
    url,
    youtube_id: youtube_id || null,
    caption: caption || null,
    added_by: user.id,
  })

  const { data: p } = await supabase.from('hall_profiles').select('slug').eq('id', profileId).single()
  revalidatePath(`/admin/hall/${p?.slug}`)
  revalidatePath(`/hall/${p?.slug}`)
}

export async function updateMediaCaption(formData: FormData) {
  const { supabase } = await requireAdmin()
  const mediaId = String(formData.get('mediaId') || '')
  const caption = String(formData.get('caption') || '')
  await supabase.from('hall_media').update({ caption: caption || null }).eq('id', mediaId)

  // obtener slug para revalidar
  const { data: m } = await supabase.from('hall_media').select('profile_id').eq('id', mediaId).single()
  const { data: p } = await supabase.from('hall_profiles').select('slug').eq('id', m?.profile_id).single()

  revalidatePath(`/admin/hall/${p?.slug}`)
  revalidatePath(`/hall/${p?.slug}`)
}

export async function deleteMedia(formData: FormData) {
  const { supabase } = await requireAdmin()
  const mediaId = String(formData.get('mediaId') || '')
  const { data: m } = await supabase.from('hall_media').select('profile_id').eq('id', mediaId).single()

  await supabase.from('hall_media').delete().eq('id', mediaId)

  const { data: p } = await supabase.from('hall_profiles').select('slug').eq('id', m?.profile_id).single()
  revalidatePath(`/admin/hall/${p?.slug}`)
  revalidatePath(`/hall/${p?.slug}`)
}
