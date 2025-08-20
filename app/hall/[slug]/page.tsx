// app/hall/[slug]/page.tsx
import { createSupabaseServerClient } from '@/utils/supabase/server'
import VoteButton from './VoteButton'
import AddMediaForm from './AddMediaForm'
import HallCommentForm from './HallCommentForm'

type Params = { params: { slug: string } }

export default async function HallProfilePage({ params }: Params) {
  const supabase = createSupabaseServerClient()

  // Perfil por slug
  const { data: profile, error: pErr } = await supabase
    .from('hall_profiles')
    .select(
      `
      id,
      slug,
      title,
      gait,
      year,
      status,
      image_url,
      votes_count
    `
    )
    .eq('slug', params.slug)
    .single()

  if (pErr || !profile) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-semibold">Miembro no encontrado</h1>
      </div>
    )
  }

  // Media de la galería
  const { data: media } = await supabase
    .from('hall_media')
    .select('id, kind, url, youtube_id, caption, created_at')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: true })

  // Comentarios (mostramos abajo)
  const { data: comments } = await supabase
    .from('hall_comments')
    .select(
      `
      id,
      content,
      created_at,
      profiles:author_id (
        id,
        full_name
      )
    `
    )
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: true })

  const GAITS: Record<string, string> = {
    trocha_galope: 'TROCHA Y GALOPE',
    trote_galope: 'TROTE Y GALOPE',
    trocha_colombia: 'TROCHA COLOMBIA',
    paso_fino: 'PASO FINO COLOMBIANO',
  }

  return (
    <div className="container py-10 space-y-10">
      {/* Cabecera */}
      <header className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-2">
          <div className="text-xs uppercase text-muted">
            {GAITS[profile.gait] || profile.gait}{' '}
            {profile.year ? `· ${profile.year}` : ''}
          </div>
          <h1 className="text-3xl font-semibold">{profile.title}</h1>
          <div className="text-sm text-muted">Estado: {profile.status}</div>
          <div className="pt-2">
            {/* Botón de votos (UI optimista) */}
            <VoteButton
              profileId={profile.id}
              slug={profile.slug}
              initialVoted={false}
              initialCount={profile.votes_count ?? 0}
            />
          </div>
        </div>

        {/* Portada: SIN recortes, respetando proporción original */}
        <div className="w-full">
          {profile.image_url ? (
            <img
              src={profile.image_url}
              alt={profile.title}
              className="w-full h-auto rounded-md shadow-sm"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="w-full h-auto rounded-md bg-neutral-100 p-8 text-center text-sm text-muted">
              Sin imagen
            </div>
          )}
        </div>
      </header>

      {/* Galería (imágenes y videos) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Galería</h2>

        {/* Formulario para subir foto (opcional) */}
        <AddMediaForm profileId={profile.id} slug={profile.slug} />

        {media && media.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((m: any) => (
              <li key={m.id} className="space-y-2">
                {m.kind === 'image' ? (
                  // -------- NO RECORTAR: object-contain y h-auto -----------
                  <img
                    src={m.url}
                    alt={m.caption ?? ''}
                    className="w-full h-auto rounded-md shadow-sm object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  // Video de YouTube embebido
                  <div className="relative w-full rounded-md overflow-hidden bg-black">
                    {/* 16:9 sin recortes */}
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${m.youtube_id}`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
                {m.caption ? (
                  <p className="text-sm text-muted">{m.caption}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Aún no hay fotos.</p>
        )}
      </section>

      {/* Comentarios */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Comentarios</h2>
        {comments && comments.length > 0 ? (
          <ul className="space-y-3">
            {comments.map((c: any) => (
              <li
                key={c.id}
                className="rounded-lg border bg-white/60 px-4 py-3 shadow-sm"
              >
                <div className="text-xs text-muted mb-1">
                  {c.profiles?.full_name || 'Usuario'} ·{' '}
                  {new Date(c.created_at).toLocaleString()}
                </div>
                <div className="text-sm">{c.content}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Sé el primero en comentar.</p>
        )}

        {/* Formulario de comentario */}
        <HallCommentForm profileId={profile.id} slug={profile.slug} />
      </section>
    </div>
  )
}
