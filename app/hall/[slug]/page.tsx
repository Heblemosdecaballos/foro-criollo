// app/hall/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'
import { GAITS } from '../_gaits'
import VoteButton from './VoteButton'
import HallCommentForm from './HallCommentForm'
import AddMediaForm from './AddMediaForm'

export const revalidate = 0

export default async function HallProfilePage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClientReadOnly()

  const { data: profile } = await supabase
    .from('hall_profiles')
    .select('id, slug, title, gait, year, bio, achievements, image_url, votes_count, status, created_at')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!profile) return notFound()

  const { data: { session } } = await supabase.auth.getSession()
  let viewerName: string | null = null
  let alreadyVoted = false

  if (session) {
    const [{ data: prof }, { data: vote }] = await Promise.all([
      supabase.from('profiles').select('full_name, username').eq('id', session.user.id).maybeSingle(),
      supabase.from('hall_votes').select('profile_id').eq('profile_id', profile.id).eq('user_id', session.user.id).maybeSingle(),
    ])
    viewerName = prof?.full_name || prof?.username || 'Usuario'
    alreadyVoted = Boolean(vote)
  }

  const [{ data: comments }, { data: media }] = await Promise.all([
    supabase
      .from('hall_comments')
      .select('id, content, created_at, author:profiles(id, full_name, username)')
      .eq('profile_id', profile.id).order('created_at', { ascending: true }),
    supabase
      .from('hall_media')
      .select('id, url, caption, created_at, added:profiles(id, full_name, username)')
      .eq('profile_id', profile.id).order('created_at', { ascending: false }),
  ])

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
          <div className="text-xs uppercase text-muted">{GAITS[profile.gait]} · {profile.year ?? '—'}</div>
          <h1 className="text-3xl font-bold">{profile.title}</h1>
          <div className="text-sm text-muted">Estado: {profile.status}</div>

          <div className="flex items-center gap-3 pt-3">
            <VoteButton profileId={profile.id} initialCount={profile.votes_count} initialVoted={alreadyVoted} />
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
          {session && profile.status === 'nominee' && <AddMediaForm profileId={profile.id} />}
        </div>

        {!media?.length ? (
          <p className="text-gray-600">Aún no hay fotos.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {media!.map((m) => {
              const by = (m as any).added?.full_name || (m as any).added?.username || 'Usuario'
              return (
                <li key={(m as any).id} className="card overflow-hidden">
                  <div className="aspect-[16/10] bg-black/5 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={(m as any).url} alt={(m as any).caption || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 text-sm">
                    {(m as any).caption && <div className="mb-1">{(m as any).caption}</div>}
                    <div className="text-muted">por {by}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Comentarios</h2>

        {!comments?.length ? (
          <p className="text-gray-600">Sé el primero en comentar.</p>
        ) : (
          <ul className="space-y-3">
            {comments!.map((c) => {
              const authorName = (c as any).author?.full_name || (c as any).author?.username || 'Autor'
              return (
                <li key={(c as any).id} className="card p-3">
                  <div className="flex items-center justify-between text-sm text-muted mb-1">
                    <span>{authorName}</span>
                    <span>{new Date((c as any).created_at as any).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{(c as any).content}</div>
                </li>
              )
            })}
          </ul>
        )}

        {session ? (
          <HallCommentForm profileId={profile.id} viewerName={viewerName} />
        ) : (
          <p className="text-sm text-gray-600">Inicia sesión para comentar.</p>
        )}
      </section>
    </div>
  )
}
