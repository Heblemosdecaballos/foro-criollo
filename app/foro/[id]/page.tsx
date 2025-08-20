// app/foro/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'
import CommentForm from './CommentForm'

export const revalidate = 0

export default async function ThreadDetail({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClientReadOnly()

  const { data: thread, error } = await supabase
    .from('threads')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error) return <div className="container p-6 text-red-700">Error: {error.message}</div>
  if (!thread) return notFound()

  const content =
    (thread as any).content ?? (thread as any).body ?? (thread as any).text ?? (thread as any).description ?? ''

  const { data: comments } = await supabase
    .from('thread_comments')
    .select('id, content, author_id, created_at')
    .eq('thread_id', params.id)
    .order('created_at', { ascending: true })

  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="container p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{(thread as any).title}</h1>
        <div className="text-sm text-muted mb-4">
          {new Date((thread as any).created_at as any).toLocaleString('es-CO')}
        </div>
        <article className="prose max-w-none whitespace-pre-wrap">
          {content || <em>Sin contenido.</em>}
        </article>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Comentarios</h2>

        {!comments?.length ? (
          <p className="text-gray-600">Sé el primero en comentar.</p>
        ) : (
          <ul className="space-y-3">
            {comments!.map(c => (
              <li key={c.id} className="card p-3">
                <div className="text-sm text-muted mb-1">
                  {new Date(c.created_at as any).toLocaleString('es-CO')}
                </div>
                <div className="whitespace-pre-wrap">{c.content}</div>
              </li>
            ))}
          </ul>
        )}

        {session ? (
          <CommentForm threadId={params.id} />
        ) : (
          <p className="text-sm text-gray-600">Inicia sesión para comentar.</p>
        )}
      </section>
    </div>
  )
}
