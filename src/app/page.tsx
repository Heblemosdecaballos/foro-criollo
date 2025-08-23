// app/page.tsx
import Link from 'next/link'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'

export const revalidate = 0

export default async function HomePage() {
  const supabase = createSupabaseServerClientReadOnly()

  let noticias: any[] = []
  try {
    const a = await supabase.from('news')
      .select('id,title,created_at')
      .order('created_at', { ascending: false })
      .limit(3)
    if (!a.error && a.data?.length) noticias = a.data
  } catch {}

  if (!noticias.length) {
    try {
      const b = await supabase.from('posts')
        .select('id,title,created_at')
        .eq('type', 'news')
        .order('created_at', { ascending: false })
        .limit(3)
      if (!b.error && b.data?.length) noticias = b.data
    } catch {}
  }

  let hilos: any[] = []
  try {
    const r = await supabase.from('threads')
      .select('id,title,created_at')
      .order('created_at', { ascending: false })
      .limit(3)
    if (!r.error && r.data) hilos = r.data
  } catch {}

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-[#5a4a30] to-[#4a6142]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[120vw] h-[38vh] bg-[var(--brand-green)]/25 blur-2xl rounded-b-[50%]" />
        <div className="relative container py-16 md:py-20">
          <h1 className="font-serif text-3xl md:text-5xl font-semibold leading-tight">
            Hablando de Caballos
          </h1>
          <p className="mt-3 max-w-2xl opacity-90">
            Comunidad, foro, historias y noticias del Caballo Criollo Colombiano.
            Comparte tus experiencias, fotos y videos.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/historias/nueva" className="btn btn-secondary">Publicar una historia</Link>
            <Link href="/foro" className="btn btn-ghost">Ver el foro</Link>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-2xl md:text-3xl">Noticias</h2>
          <Link href="/noticias" className="link">Ver todas</Link>
        </div>
        {noticias.length === 0 ? (
          <div className="card p-5 text-muted">Sin noticias aún</div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {noticias.map((n) => (
              <li key={n.id} className="card p-5">
                <h3 className="font-medium">{n.title}</h3>
                <div className="text-sm text-muted mt-1">
                  {new Date(n.created_at as any).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="container">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-2xl md:text-3xl">Últimos hilos del foro</h2>
          <Link href="/foro" className="link">Ver todos</Link>
        </div>
        {hilos.length === 0 ? (
          <div className="card p-5 text-muted">Sin hilos aún</div>
        ) : (
          <ul className="space-y-3">
            {hilos.map((t) => (
              <li key={t.id} className="card p-4">
                <Link href={`/foro/${t.id}`} className="font-medium hover:underline">{t.title}</Link>
                <div className="text-sm text-muted">
                  {new Date(t.created_at as any).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
