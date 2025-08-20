// app/hall/nueva/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

function slugify(s: string) {
  return s
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function fileExt(name: string) {
  const p = name.lastIndexOf('.')
  return p === -1 ? '' : name.slice(p + 1)
}

export async function createHallProfile(formData: FormData) {
  const title = String(formData.get('title') || '').trim().slice(0, 200)
  const gait = String(formData.get('gait') || '').trim()
  const year = formData.get('year') ? Number(formData.get('year')) : null
  const bio = String(formData.get('bio') || '')
  const achievements = String(formData.get('achievements') || '')
  const cover = formData.get('cover') as File | null

  if (!title) throw new Error('El título es obligatorio')
  if (!['trocha_galope','trote_galope','trocha_colombia','paso_fino'].includes(gait))
    throw new Error('Andar inválido')

  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Debes iniciar sesión')

  // slug único
  let slug = slugify(title)
  if (!slug) slug = randomUUID().slice(0, 8)
  const exists = await supabase
    .from('hall_profiles')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (exists.data) slug = `${slug}-${randomUUID().slice(0, 4)}`

  // portada opcional al bucket 'hall'
  let image_url: string | null = null
  if (cover && cover.size > 0) {
    const ext = fileExt(cover.name) || 'jpg'
    const path = `covers/${slug}-${randomUUID()}.${ext}`
    const up = await supabase.storage.from('hall').upload(path, cover, {
      contentType: cover.type || 'image/jpeg',
      cacheControl: '3600',
    })
    if (up.error) throw new Error(up.error.message)
    const { data: pub } = supabase.storage.from('hall').getPublicUrl(path)
    image_url = pub.publicUrl
  }

  const ins = await supabase
    .from('hall_profiles')
    .insert({
      slug,
      title,
      gait,
      year,
      bio,
      achievements,
      image_url,
      status: 'nominee',
    })
    .select('slug')
    .single()

  if (ins.error) throw new Error(ins.error.message)

  revalidatePath('/hall')
  redirect(`/hall/${slug}`)
}

// Alias para que tus imports actuales no fallen:
export { createHallProfile as createNomination }
