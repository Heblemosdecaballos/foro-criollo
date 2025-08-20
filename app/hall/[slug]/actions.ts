// app/hall/[slug]/actions.ts (añade esto)
export async function addYoutubeAction(formData: FormData) {
  const profileId = String(formData.get('profileId') || '')
  const slug = String(formData.get('slug') || '')
  const url = String(formData.get('url') || '').trim()

  if (!profileId) return { ok: false, error: 'Perfil inválido.' }
  if (!url) return { ok: false, error: 'Ingresa una URL de YouTube.' }

  // Extraer ID de YouTube (youtu.be / watch?v= / shorts)
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
