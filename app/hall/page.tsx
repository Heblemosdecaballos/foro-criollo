// app/hall/page.tsx
import Link from 'next/link'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'
import { GAITS, assertGait, type Gait } from './_gaits'

export const revalidate = 0

type Status = 'nominee' | 'inducted' | 'archived'

type HallRow = {
  id: string
  slug: string
  title: string
  gait: Gait
  year: number | null
  image_url: string | null
  votes_count: number
  status: Status
}

export default async function HallPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  // Andar seleccionado
  const gParam = typeof searchParams?.g === 'string' ? searchParams.g : undefined
  const g = assertGait(gParam)

  // Vista: inducidos o nominados
  const vParam = typeof searchParams?.view === 'string' ? searchParams.view : undefined
  const view: 'inducted' | 'nominees' = vParam === 'nominees' ? 'nominees' : 'inducted'

  const supabase = createSupabaseServerClientReadOnly()

  const { data: rowsRaw, error } = await supabase
    .from('hall_profiles')
    .select('id, slug, title, gait, year, image_url, votes_count, status')
    .eq('gait', g)
    .eq('status', view === 'nominees' ? 'nominee' : 'inducted')
    .order('title', { ascending: true })

  if (error) console.error('hall list error:', error)

  const rows: HallRow[] =
    (rowsRaw ?? []).map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      gait: assertGait(r.gait),
      year: r.year ?? null,
      image_url: r.image_url ?? null,
      votes_count: r.votes_count ?? 0,
      status: (r.status ?? 'nominee') as Status,
    }))

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hall de la Fama</h1>
        <Link href="/hall/nueva" className="btn btn-primary">
          + Nominar
        </Link>
      </div>

      {/* Pestañas de andares */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['trocha_galope', 'Trocha y Galope'],
            ['trote_galope', 'Trote y Galope'],
            ['trocha_colombia', 'Trocha Colombia'],
            ['paso_fino', 'Paso Fino Colombiano'],
          ] as Array<[Gait, string]>
        ).map(([key, label]) => (
          <Link
            key={key}
            href={`/hall?g=${key}&view=${view}`}
            className={`btn btn-ghost ${g === key ? 'ring-1 ring-black/10' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Toggle Inducidos / Nominados */}
      <div className="flex gap-2">
        <Link
          href={`/hall?g=${g}&view=inducted`}
          className={`btn ${view === 'inducted' ? 'btn-secondary' : 'btn-ghost'}`}
        >
          Inducidos
        </Link>
        <Link
          href={`/hall?g=${g}&view=nominees`}
          className={`btn ${view === 'nominees' ? 'btn-secondary' : 'btn-ghost'}`}
        >
          Nominados
        </Link>
      </div>

      {!rows.length ? (
        <p className="text-muted">No hay registros.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-3">
          {rows.map((p) => (
            <li key={p.id} className="card overflow-hidden">
              <Link href={`/hall/${p.slug}`} className="block">
                <div className="aspect-[16/9] bg-black/5 overflow-hidden">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-sm text-muted">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase text-muted">
                    {GAITS[p.gait]} · {p.year ?? '—'}
                  </div>
                  <h3 className="font-medium">{p.title}</h3>
                  <div className="text-xs text-muted mt-1">{p.votes_count} votos</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
