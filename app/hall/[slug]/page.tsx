// /app/hall/[slug]/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/utils/supabase/server'

// Si ya tienes estos componentes, los usamos.
// Si tus rutas de componentes son otras, avísame y te los adapto.
import HallCommentForm from './HallCommentForm'
import AddMediaForm from './AddMediaForm'

function toArray<T>(v: T[] | null | undefined): T[] {
  return v ?? []
}

export default async function HallProfilePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createSupabaseServerClient()

  // 1) Perfil
  const profileRes = await supabase
    .from('hall_profiles')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (profileRes.error || !profileRes.data) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-semibold">No se encontró el perfil</h1>
        <p className="text-sm text-muted">Slug: {params.slug}</p>
      </div>
    )
  }

  const profile = profileRes.data

  // 2) Usuario actual (para permisos)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let viewerProfile: any = null
  if (user?.id) {
    const meRes = await supabase
      .from('profiles')
      .select('id, name, is_admin')
      .eq('id', user.id)
      .single()
    viewerProfile = meRes.data ?? null
  }

  const canUpload = !!viewerProfile?.is_admin // solo admin puede subir

  // 3) Medios y comentarios (siempre null-safe)
  const mediaRes = await supabase
    .from('hall_media')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
  const media = toArray(mediaRes.data)

  const commentsRes = await supabase
    .from('hall_comments')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: true })
  const comments = toArray(commentsRes.data)

  return (
    <div className="container py-8 space-y-10">
      {/* Cabecera */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* Portada SIN recorte */}
          {profile.cover_url ? (
            <div className="relative w-full aspect-[4/3] bg-neutral-100 rounded-xl overflow-hidden">
              <Image
                src={profile.cover_url}
                alt={profile.title}
                fill
                priority
                className="object-contain"   // <- NO recorta
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-neutral-100 rounded-xl grid place-items-center">
              <span className="text-sm text-muted">Sin imagen</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-xs uppercase text-muted">
            {profile.gait?.replaceAll('_', ' ').toUpperCase()} {profile.year ? `· ${profile.year}` : ''}
          </div>
          <h1 className="text-3xl font-bold">{profile.title}</h1>
        </div>
      </div>

      {/* Galería */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Galería</h2>

        {media.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay fotos.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((m: any) => (
              <li key={m.id} className="space-y-2">
                <div className="relative w-full aspect-[4/3] bg-neutral-100 rounded-lg overflow-hidden">
                  <Image
                    src={m.url}
                    alt={m.caption ?? ''}
                    fill
                    className="object-contain" // <- NO recorta
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                {m.caption ? (
                  <p className="text-xs text-muted-foreground">{m.caption}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Comentarios */}
      <section className="space-y-4" id="comments">
        <h2 className="text-lg font-semibold">Comentarios</h2>

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sé el primero en comentar.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c: any) => (
              <li key={c.id} className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">
                  {c.author_name ?? 'Anónimo'}
                </div>
                <div className="text-sm">{c.content}</div>
              </li>
            ))}
          </ul>
        )}

        {/* Formulario para comentar */}
        <HallCommentForm
          profileId={profile.id}
          viewerName={viewerProfile?.name ?? null}
        />
      </section>

      {/* >>>>>>>>>>>>>>>  Subida de archivos debajo de comentarios  <<<<<<<<<<<<<< */}
      {canUpload && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Agregar foto o video</h2>
          <AddMediaForm profileId={profile.id} slug={profile.slug} />
        </section>
      )}

      <div>
        <Link href="/hall" className="text-sm underline">
          ← Volver al Hall
        </Link>
      </div>
    </div>
  )
}
