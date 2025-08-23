// /app/hall/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/utils/supabase/server'

const GAITS: { key: string; label: string }[] = [
  { key: 'trocha_galope', label: 'Trocha y Galope' },
  { key: 'trote_galope',  label: 'Trote y Galope' },
  { key: 'trocha_colombia', label: 'Trocha Colombia' },
  { key: 'paso_fino', label: 'Paso Fino Colombiano' },
]

export default async function HallPage() {
  const supabase = createSupabaseServerClient()

  const dataByGait: Record<string, any[]> = {}

  for (const g of GAITS) {
    const res = await supabase
      .from('hall_profiles')
      .select('id, slug, title, year, cover_url, gait')
      .eq('gait', g.key)
      .order('title', { ascending: true })   // <-- orden alfabético
    dataByGait[g.key] = res.data ?? []
  }

  return (
    <div className="container py-8 space-y-10">
      <h1 className="text-3xl font-bold">Hall de la Fama</h1>

      {GAITS.map((g) => {
        const items = dataByGait[g.key] ?? []
        return (
          <section key={g.key} className="space-y-4">
            <h2 className="text-xl font-semibold">{g.label}</h2>

            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay caballos en esta categoría.
              </p>
            ) : (
              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {items.map((p: any) => (
                  <li key={p.id}>
                    <Link href={`/hall/${p.slug}`} className="block">
                      <div className="relative w-full aspect-[4/3] bg-neutral-100 rounded-lg overflow-hidden">
                        {p.cover_url ? (
                          <Image
                            src={p.cover_url}
                            alt={p.title}
                            fill
                            className="object-contain" // <- NO recorta
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-xs text-muted bg-neutral-100">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.year ?? '—'}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
