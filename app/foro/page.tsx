// app/foro/page.tsx
import Link from 'next/link'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const revalidate = 0

export default async function ForoPage() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('threads')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-red-700">Error: {error.message}</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Foro</h1>
        <Link href="/foro/nuevo" className="rounded bg-amber-700 text-white px-3 py-2">
          + Nuevo hilo
        </Link>
      </div>

      {!data?.length ? (
        <p>No hay hilos todavía.</p>
      ) : (
        <ul className="space-y-3">
          {data.map(t => (
            <li key={t.id} className="border rounded p-3 bg-white">
              <Link href={`/foro/${t.id}`} className="font-medium hover:underline">{t.title}</Link>
              <div className="text-sm text-gray-500">
                {new Date(t.created_at as any).toLocaleString('es-CO')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
