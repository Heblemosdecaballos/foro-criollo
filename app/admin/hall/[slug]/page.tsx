// /app/hall/[slug]/page.tsx
import { createSupabaseServerClient } from '@/utils/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

type Media = {
  id: string
  profile_id: string
  kind: 'image' | 'video'
  url: string
  caption: string | null
  created_at: string
}

type Comment = {
  id: string
  profile_id: string
  content: string
  author_name: string | null
  created_at: string
}

import HallCommentForm from './HallCommentForm'   // tu form de comentarios (server action)
import AddMediaForm from './AddMediaForm'         // tu form de upload (server action)

export default async function HallProfilePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createSupabaseServerClient()

  // Perfil
  const { data: profile, error: profileErr } = await supabase
    .from('hall_profiles')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (profileErr || !profile) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold">No encontrado</h1>
        <p className="mt-2 text-sm text-muted">
          No se encontró el caballo <b>{params.slug}</b>.
        </p>
        <div className="mt-6">
          <Link href="/hall" className="btn btn-primary">Volver</Link>
        </div>
      </div>
    )
  }

  // Portada (si la tienes en la tabla; si no, puedes quitar esta parte)
  const coverUrl: string | null = profile.cover_url ?? null

  // Media
  const mediaRes = await supabase
    .from('hall_media')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
  const media: Media[] = mediaRes.data ?? []

  // Comentarios
  const commentsRes = await supabase
    .from('hall_comments')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: true })
  const comments: Comment[] = commentsRes.data ?? []

  // Sesión y perfil del viewer (para bloquear upload a admin si quieres)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const viewerId = session?.user?.id ?? null
  let viewerProfile: { id: string; is_admin: boolean; name: string | null } | null =
    null

  if (viewerId) {
    const { data: vp } = await supabase
      .from('profiles')
      .select('id, is_admin, name')
      .eq('id', viewerId)
      .single()
    viewerProfile = vp ?? null
  }

  const canUpload = !!viewerProfile?.is_admin // solo admin sube; cambia si quieres

  return (
    <div className="container py-10 space-y-10">
      {/* Encabezado */}
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted">
          {profile.gait} {profile.year ? `• ${profile.year}` : ''}
        </p>
        <h1 className="text-3xl font-bold">{profile.title}</h1>
      </header>

      {/* Portada */}
      {coverUrl && (
        <div className="rounded-lg border overflow-hidden">
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={coverUrl}
              alt={profile.title}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-contain bg-neutral-100"
              priority
            />
          </div>
        </div>
      )}

      {/* Galería */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Galería</h2>

        {media.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay fotos ni videos.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((m) => (
              <li key={m.id} className="rounded-lg border overflow-hidden">
                {m.kind === 'image' ? (
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={m.url}
                      alt={m.caption ?? ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain bg-neutral-100"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video bg-black">
                    <video
                      controls
                      preload="metadata"
                      className="h-full w-full object-contain"
                    >
                      <source src={m.url} />
                    </video>
                  </div>
                )}
                {m.caption && <div className="p-2 text-sm">{m.caption}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Comentarios */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Comentarios</h2>

        {comments.length === 0 ? (
          <p className="text-sm text-muted">Sé el primero en comentar.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded-lg border p-3">
                <div className="text-sm">
                  <b>{c.author_name ?? 'Usuario'}</b>{' '}
                  <span className="text-muted">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1">{c.content}</div>
              </li>
            ))}
          </ul>
        )}

        {/* Formulario de comentario */}
        <HallCommentForm profileId={profile.id} viewerName={viewerProfile?.name ?? null} />
      </section>

      {/* SUBIDA DE ARCHIVOS — debajo de comentarios */}
      {canUpload && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Agregar fotos o videos</h2>
          <AddMediaForm profileId={profile.id} slug={profile.slug} />
        </section>
      )}
    </div>
  )
}
