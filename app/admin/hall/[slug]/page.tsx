// app/admin/hall/[slug]/page.tsx
import { createSupabaseServerClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile, updateMediaCaption, deleteMedia, uploadCover, addMediaAdmin } from './actions'

type Params = { params: { slug: string } }

export default async function AdminHallEditor({ params }: Params) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: me } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!me?.is_admin) redirect('/')

  const { data: profile, error } = await supabase
    .from('hall_profiles')
    .select('id, slug, title, gait, year, status, image_url')
    .eq('slug', params.slug).single()
  if (error || !profile) redirect('/admin')

  const { data: media } = await supabase
    .from('hall_media')
    .select('id, kind, url, youtube_id, caption, created_at')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Editar: {profile.title}</h2>
        <a href="/admin" className="text-sm underline">Volver</a>
      </div>

      {/* DATOS DEL PERFIL */}
      <form action={updateProfile} className="rounded-md border bg-white/60 p-4 space-y-3">
        <input type="hidden" name="profileId" value={profile.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Título
            <input name="title" defaultValue={profile.title} className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>
          <label className="text-sm">
            Año
            <input name="year" type="number" defaultValue={profile.year ?? ''} className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>
          <label className="text-sm">
            Gait (trocha_galope, trote_galope, trocha_colombia, paso_fino)
            <input name="gait" defaultValue={profile.gait} className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>
          <label className="text-sm">
            Estado (nominee / inducted)
            <input name="status" defaultValue={profile.status} className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>
        </div>
        <button className="btn btn-primary">Guardar datos</button>
      </form>

      {/* PORTADA */}
      <div className="rounded-md border bg-white/60 p-4 space-y-3">
        <h3 className="font-medium">Portada</h3>
        {profile.image_url ? (
          <img src={profile.image_url} alt="" className="max-w-md h-auto rounded" />
        ) : <div className="text-sm text-muted">Sin portada</div>}
        <form action={uploadCover} className="flex items-center gap-3">
          <input type="hidden" name="profileId" value={profile.id} />
          <input type="file" name="cover" accept="image/*" />
          <button className="btn btn-secondary">Subir nueva portada</button>
        </form>
      </div>

      {/* SUBIR A GALERÍA */}
      <div className="rounded-md border bg-white/60 p-4 space-y-3">
        <h3 className="font-medium">Agregar a galería</h3>
        <form action={addMediaAdmin} className="flex flex-col gap-3">
          <input type="hidden" name="profileId" value={profile.id} />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input type="file" name="file" accept="image/*" />
            <input name="caption" placeholder="Leyenda (opcional)" className="w-full rounded-md border px-3 py-2" />
          </div>
          <div className="text-sm text-muted">
            Para YouTube, deja el archivo vacío y envía el ID de YouTube aquí:
          </div>
          <input name="youtube_id" placeholder="YouTube ID (opcional)" className="w-full rounded-md border px-3 py-2" />
          <button className="btn btn-secondary w-fit">Agregar</button>
        </form>
      </div>

      {/* GALERÍA (editar leyendas / eliminar) */}
      <div className="space-y-3">
        <h3 className="font-medium">Galería</h3>
        {media && media.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((m: any) => (
              <li key={m.id} className="rounded-md border bg-white/60 p-3 space-y-2">
                <div className="relative w-full rounded overflow-hidden bg-neutral-100">
                  <div className="aspect-video">
                    {m.kind === 'image' ? (
                      <img src={m.url} alt={m.caption ?? ''} className="absolute inset-0 w-full h-full object-contain" />
                    ) : (
                      <iframe
                        src={`https://www.youtube.com/embed/${m.youtube_id}`}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>

                <form action={updateMediaCaption} className="flex items-center gap-2">
                  <input type="hidden" name="mediaId" value={m.id} />
                  <input
                    name="caption"
                    defaultValue={m.caption ?? ''}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Leyenda"
                  />
                  <button className="btn btn-secondary">Guardar</button>
                </form>

                <form action={deleteMedia}>
                  <input type="hidden" name="mediaId" value={m.id} />
                  <button className="btn btn-danger" onClick={(e) => {
                    if (!confirm('¿Eliminar este elemento?')) e.preventDefault()
                  }}>
                    Eliminar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Aún no hay elementos.</p>
        )}
      </div>
    </div>
  )
}
