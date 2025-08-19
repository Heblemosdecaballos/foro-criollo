// app/foro/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export default async function ThreadDetail({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error) return <div className="max-w-3xl mx-auto p-6 text-red-700">Error: {error.message}</div>
  if (!data) return notFound()

  const content = (data as any).content ?? (data as any).body ?? (data as any).text ?? (data as any).description ?? ''

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-3">{(data as any).title}</h1>
      <div className="text-sm text-gray-500 mb-6">
        {new Date((data as any).created_at as any).toLocaleString('es-CO')}
      </div>
      <article className="prose max-w-none whitespace-pre-wrap">
        {content || <em>Sin contenido.</em>}
      </article>
    </div>
  )
}
