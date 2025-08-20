// app/hall/nueva/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type Resp = { ok: true; slug: string } | { ok: false; error: string }

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function createNomination(formData: FormData): Promise<Resp> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no-auth' }

  const title = String(formData.get('title') || '').trim()
  const gait  = String(formData.get('gait')  || 'trocha_galope').trim()
  const year  = formData.get('year') ? Number(formData.get('year')) : null
  const bio   = String(formData.get('bio') || '').trim()
  const achievements = String(formData.get('achievements') || '').trim()
  const image_url    = String(formData.get('image_url')    || '').trim()

  if (!title) return { ok: false, error: 'title-required' }
  let slug = slugify(title) || ('hall-' + Date.now())

  // Evitar duplicados de slug
  const { data: exists } = await supabase.from('hall_profiles').select('id').eq('slug', slug).maybeSingle()
  if (exists) slug = `${slug}-${Math.floor(Math.random()*1000)}`

  const { error } = await supabase.from('hall_profiles').insert({
    slug, title, gait, year, bio, achievements, image_url, status: 'nominee', created_by: user.id
  })

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/hall?g=${gait}&view=nominees`)
  return { ok: true, slug }
}
