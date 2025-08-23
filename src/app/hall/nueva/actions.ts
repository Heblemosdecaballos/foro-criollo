// app/hall/nueva/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
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
  try {
    const title = String(formData.get('title') || '').trim().slice(0, 200)
    const gait = String(formData.get('gait') || '').trim()
    const year = formData.get('year') ? Number(formData.get('year')) : null
    const bio = String(formData.get('bio') || '')
    const achievements = String(formData.get('achievements') || '')
    const cover = formData.get('cover') as File | null

    if (!title) return { ok: false, error: 'El título es obligatorio' }
    if (!['trocha_galope','trote_galope','trocha_colombia','paso_fino'].includes(gait))
      return { ok: false, error: 'Andar inválido' }

    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Debes iniciar sesión' }

    // slug único
    let slug = slugify(title)
    if (!slug) slug = randomUUID().slice(0, 8)
    const exists = await supabase
      .from('hall_profiles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (exists.data) slug = `${slug}-${randomUUID().slice(0, 4)}`

    // portada opcional
    let image_url: string | null = null
    if (cover && cover.size > 0) {
      const ext = fileExt(cover.name) || 'jpg'
      const path = `covers/${slug}-${randomUUID()}.${ext}`
      // ⚠️ usar arrayBuffer para evitar problemas en runtime
      const buffer = await cover.arrayBuffer()
      const upload = await supabase.storage
        .from('hall')
        .upload(path, buffer, {
          contentType: cover.type || 'image/jpeg',
          cacheControl: '3600',
        })
      if (upload.error) return { ok: false, error: upload.error.message }

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
    if (ins.error) return { ok: false, error: ins.error.message }

    revalidatePath('/hall')
    return { ok: true, slug }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Error inesperado' }
  }
}

// alias si tu UI usa este nombre
export { createHallProfile as createNomination }
