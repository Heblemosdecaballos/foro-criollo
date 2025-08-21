// /app/admin/hall/[slug]/page.tsx
import { createSupabaseServerClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

type Media = {
  id: string
  profile_id: string
  kind: 'image' | 'video'
  url: string
  caption: string | null
  created_at: string
}

export default async function AdminHallProfilePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createSupabaseServerClient()

  // Cargamos el perfil por slug
  const { data: profile, error: profileErr } = await supabase
    .from('hall_profiles')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (profileErr || !profile) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold">Error en editor del Hall</h1>
        <p className="mt-2 text-sm text-muted">
          No se pudo cargar el perfil con el slug: <b>{params.slug}</b>.
        </p>
        <div className="mt-6">
          <Link href="/admin" className="btn btn-primary">Volver al panel</Link>
        </div>
      </div>
    )
  }

  // Cargamos medios (FORZAMOS arreglo vacío si data viene null)
  const mediaRes = await supabase
    .from('hall_media')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })

  const media: Media[] = mediaRes.data ?? []  // <- CLAVE: nunca null

  return (
    <div className="container py-12 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Editor: {profile.title}
        </h1>
        <Link href="/admin" className="btn btn-primary">Volver</Link>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Datos del perfil</h2>
        <div className="rounded-lg border p-4 space-y-1">
          <p><b>Andar:</b> {profile.gait}</p>
          <p><b>Año:</b> {profile.year ?? '—'}</p>
          <p><b>Slug:</b> {profile.slug}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Medios</h2>

        {media.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay archivos.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((m) => (
              <li key={m.id} className="rounded-lg border overflow-hidden">
                {m.kind === 'image' ? (
                  // Usamos fill+object-contain para ver la imagen completa sin recorte
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={m.url}
                      alt={m.caption ?? ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain bg-neutral-100"
                      priority={false}
                      // IMPORTANTE: si usas dominios de Supabase y Next <Image>,
                      // recuerda tenerlos en next.config.js -> images.domains
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
                {m.caption && (
                  <div className="p-2 text-sm">{m.caption}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
