// app/perfil/actions.ts
'use server'

import { createSupabaseServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type Resp = { ok: true } | { ok: false; error: string }

export async function updateProfileAction(formData: FormData): Promise<Resp> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'no-auth' }

  const full_name = String(formData.get('full_name') || '').trim()
  const username  = String(formData.get('username') || '').trim()
  const phone     = String(formData.get('phone') || '').trim()

  // username único (en minúsculas)
  const { error } = await supabase
    .from('profiles')
    .update({ full_name, username, phone })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/perfil')
  return { ok: true }
}
