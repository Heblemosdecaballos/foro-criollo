// app/hall/page.tsx
import Link from 'next/link'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'

export const revalidate = 0

export default async function HallPage() {
  const supabase = createSupabaseServerClientReadOnly()

  const [inductedRes, nomineesRes, sessionRes] = await Promise.all([
    supabase.from('hall_profiles')
      .select('id, slug, title, category, year, image_url, votes_count, status')
      .eq('status', 'inducted')
      .order('year', { ascending: false }),
    supabase.from('hall_profiles')
      .select('id, slug, title, category, year, image_url, votes_count, status')
      .eq('status', 'nominee')
      .order('votes_count', { ascending: false }),
    supabase.auth.getSession()
  ])

  const inducted  = inductedRes.data ?? []
  const nominees  = nomineesRes.data ?? []
  const session   = sessionRes.data.session

  return (
    <div className="container py-8 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hall de la fama</h1>
        {session ? (
          <Link href="/hall/nueva" className="btn btn-primary">+ Nominar</Link>
        ) : (
          <Link href="/auth?next=/hall/nueva" className="btn btn-ghost">Inicia sesión para nominar</Link>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Inducidos</h2>
        {inducted.length === 0 ? (
          <p className="text-muted">Aún no hay inducidos.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {inducted.map(p => (
              <li key={p.id} className="card overflow-hidden">
                <Link href={`/hall/${p.slug}`} className="block">
                  <div className="aspect-[16/9] bg-black/5 overflow-hidden">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-sm text-muted">Sin imagen</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs uppercase text-muted">{p.category} · {p.year ?? '—'}</div>
                    <h3 className="font-medium">{p.title}</h3>
                    <div className="text-xs text-muted mt-1">{p.votes_count} votos</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Nominados</h2>
        {nominees.length === 0 ? (
          <p className="text-muted">Aún no hay nominados.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {nominees.map(p => (
              <li key={p.id} className="card overflow-hidden">
                <Link href={`/hall/${p.slug}`} className="block">
                  <div className="aspect-[16/9] bg-black/5 overflow-hidden">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-sm text-muted">Sin imagen</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs uppercase text-muted">{p.category} · {p.year ?? '—'}</div>
                    <h3 className="font-medium">{p.title}</h3>
                    <div className="text-xs text-muted mt-1">{p.votes_count} votos</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
