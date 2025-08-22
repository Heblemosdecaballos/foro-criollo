// app/admin/page.tsx
import { createSupabaseServerClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminHome() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: me } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!me?.is_admin) redirect('/')

  const { data: profiles } = await supabase
    .from('hall_profiles')
    .select('id, slug, title, status, gait, year')
    .order('title', { ascending: true })

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Hall de la Fama</h2>
      <ul className="divide-y rounded-md border bg-white/60">
        {(profiles ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between px-4 py-3">
            <div className="text-sm">
              <div className="font-medium">{p.title}</div>
              <div className="text-muted text-xs">
                {p.gait} · {p.year ?? 's/a'} · {p.status}
              </div>
            </div>
            <a
              className="btn btn-secondary"
              href={`/admin/hall/${p.slug}`}
            >
              Editar
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
