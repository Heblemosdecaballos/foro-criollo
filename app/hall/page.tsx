// app/hall/page.tsx
import Link from 'next/link'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'
import { GAITS, assertGait } from './_gaits'

export const revalidate = 0

export default async function HallPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const g = assertGait(searchParams?.g)
  const view = (searchParams?.view === 'nominees') ? 'nominees' : 'inducted' // default: inducidos
  const supabase = createSupabaseServerClientReadOnly()

  const { data: rows } = await supabase
    .from('hall_profiles')
    .select('id, slug, title, gait, year, image_url, votes_count, status')
    .eq('gait', g)
    .eq('status', view === 'nominees' ? 'nominee' : 'inducted')
    .order('title', { ascending: true }) // orden alfabético
    .returns<any[]>()

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hall de la Fama</h1>
        <Link href="/hall/nueva" className="btn btn-primary">+ Nominar</Link>
      </div>

      {/* pestañas de andares */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(GAITS).map(([key, label]) => (
          <Link
            key={key}
            href={`/hall?g=${key}&view=${view}`}
            className={`btn btn-ghost ${g === key ? 'ring-1 ring-black/10' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* toggle inducidos / nominados */}
      <div className="flex gap-2">
        <Link href={`/hall?g=${g}&view=inducted`} className={`btn ${view==='inducted'?'btn-secondary':'btn-ghost'}`}>
          Inducidos
        </Link>
        <Link href={`/hall?g=${g}&view=nominees`} className={`btn ${view==='nominees'?'btn-secondary':'btn-ghost'}`}>
          Nominados
        </Link>
      </div>

      {(!rows || rows.length === 0) ? (
        <p className="text-muted">No hay registros.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-3">
          {rows.map((p) => (
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
                  <div className="text-xs uppercase text-muted">{GAITS[p.gait]} · {p.year ?? '—'}</div>
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
