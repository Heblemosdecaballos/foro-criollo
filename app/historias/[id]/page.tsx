// app/historias/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server'
import CommentForm from './CommentForm'

export const revalidate = 0

export default async function StoryDetail({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClientReadOnly()

  // Busca la historia en 'stories' o 'posts'
  let story: any = null
  for (const table of ['stories', 'posts'] as const) {
    const r = await supabase.from(table).select('*').eq('id', params.id).maybeSingle()
    if (r.data) { story = r.data; break }
    if (r.error && r.error.code !== 'PGRST116') {
      return <div className="container p-6 text-red-700">Error: {r.error.message}</div>
    }
  }
  if (!story) return notFound()

  const content = story.content ?? story.body ?? story.text ?? story.description ?? ''

  const { data: comments } = await supabase
    .from('story_comments')
    .select('id, content, created_at, author:profiles(id, username, full_name)')
    .eq('story_id', params.id)
    .order('created_at', { ascending: true })

  const { data: { session } } = await supabase.auth.getSession()
  let viewerName: string | null = null
  if (session) {
    const { data: prof } = await supabase
      .from('profiles').select('full_name, username').eq('id', session.user.id).maybeSingle()
    viewerName = prof?.full_name || prof?.username || 'Usuario'
  }

  return (
    <div className="container p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
        <div className="text-sm text-muted mb-4">
          {new Date(story.created_at as any).toLocaleString('es-CO')}
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
            {comments!.map((c) => {
              const authorName =
                (c as any).author?.full_name ||
                (c as any).author?.username ||
                'Autor'
              return (
                <li key={(c as any).id} className="card p-3">
                  <div className="flex items-center justify-between text-sm text-muted mb-1">
                    <span>{authorName}</span>
                    <span>{new Date((c as any).created_at as any).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{(c as any).content}</div>
                </li>
              )
            })}
          </ul>
        )}

        {session ? (
          <CommentForm storyId={params.id} viewerName={viewerName} />
        ) : (
          <p className="text-sm text-gray-600">Inicia sesión para comentar.</p>
        )}
      </section>
    </div>
  )
}
