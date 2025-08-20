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
  // gait actual (pestaña seleccionada)
  const gParam = typeof searchParams?.g === 'string' ? searchParams!.g : undefined
  const g = assertGait(gParam)

  // vista: inducidos o nominados
  const vParam = typeof searchParams?.view === 'string' ? searchParams!.view : undefined
  const view: 'inducted' | 'nominees' = vParam === 'nominees' ? 'nominees' : 'inducted'

  const supabase = createSupabaseServerClientReadOnly()

  const { data: rowsRaw, error } = await supabase
    .from('hall_profiles')
    .select('id, slug, title, gait, year, image_url, votes_count, status')
    .eq('gait', g)
    .eq('status', view === 'nominees' ? 'nominee' : 'inducted')
    .order('title', { ascending: true })

  if (error) {
    console.error('hall list error:', error)
  }

  // Normalizamos y tipamos los resultados
  const rows: HallRow[] = (rowsRaw ?? []).map((r: any) => ({
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

      {/* pestañas de andares */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['trocha_galope', 'Trocha y Galope'],
            ['trote_galope', 'Trote y Galope'],
            ['trocha_colombia', 'Trocha Colombia'],
            ['paso_fino', 'Paso Fino Colombiano'],
          ] as Array<[Gait, string]>
        ).map(([key, label]) => (
          <Lin
