// app/hall/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'
import VoteButton from './VoteButton'
import HallCommentForm from './HallCommentForm'
import AddMediaForm from './AddMediaForm'
import { GAITS, assertGait, type Gait } from '../_gaits'

export const revalidate = 0

type HallStatus = 'nominee' | 'inducted' | 'archived'

type HallProfile = {
  id: string
  slug: string
  title: string
  gait: Gait
  year: number | null
  bio: string | null
  achievements: string | null
  image_url: string | null
  votes_count: number
  status: HallStatus
  created_at: string
}

export default async function HallProfilePage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClientReadOnly()

  // ── Perfil del caballo
  const { data: profileRaw, error: profErr } = await supabase
    .from('hall_profiles')
    .select('id, slug, title, gait, year, bio, achievements, image_url, votes_count, status, created_at')
    .eq('slug', params.slug)
    .maybeSingle()

  if (profErr) console.error(profErr)
  if (!profileRaw) return notFound()

  // Garantizamos el tipo correctamente con una aserción segura del gait
  const profile: HallProfile = {
    ...(profileRaw as any),
    gait: assertGait((profileRaw as any).gait),
  }

  // ── Sesión: nombre del usuario y si ya votó
  const { data: { session } } = await supabase.auth.getSession()
  let viewerName: string | null = null
  let alreadyVoted = false

  if (session) {
    const [{ data: prof }, { data: vote }] = await Promise.all([
      supabase.from('profiles').select('full_name, username').eq('id', session.user.id).maybeSingle(),
      supabase.from('hall_votes').select('profile_id').eq('profile_id', profile.id).eq('user_id', session.user.id).maybeSingle(),
    ])
    viewerName = (prof as any)?.full_name || (prof as any)?.username || 'Usuario'
    alreadyVoted = Boolean(vote)
  }

  // ── Comentarios y galería
  const [{ data: comments }, { data: media }] = await Promise.all([
    supabase
      .from('hall_comments')
      .select('id, content, created_at, author:profiles(id, full_name, username)')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('hall_media')
      .select('id, url, caption, created_at, added:profiles(id, full_name, username)')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false }),
  ])

  const gaitLabel = GAITS[profile.gait]

  return (
    <div className="container py-8 space-y-8">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="aspect-[16/9] bg-black/5 overflow-hidden rounded">
          {profile.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.image_url} alt={profile.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-sm text-muted">Sin imagen</div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase text-muted">
            {gaitLabel} · {profile.year ?? '—'}
          </div>
          <h1 className="text-3xl font-bold">{profile.title}</h1>
          <div className="text-sm text-muted">Estado: {profile.status}</div>

          <div className="flex items-center gap-3 pt-3">
            <VoteButton
              profileId={profile.id}
              initialCount={profile.votes_count}
              initialVoted={alreadyVoted}
            />
          </div>
        </div>
      </div>

      {(profile.bio || profile.achievements) && (
        <section className="grid md:grid-cols-2 gap-6">
          <article className="prose max-w-none whitespace-pre-wrap">
            <h2>Biografía</h2>
            {profile.bio || <em>Sin contenido.</em>}
          </article>
          <article className="prose max-w-none whitespace-pre-wrap">
            <h2>Logros</h2>
            {profile.achievements || <em>—</em>}
          </article>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Galería</h2>
          {ses
