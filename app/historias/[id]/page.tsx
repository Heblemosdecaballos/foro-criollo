// app/historias/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/utils/supabase/server'
import CommentForm from './CommentForm'

export const revalidate = 0

export default async function StoryDetail({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()

  // Intentamos leer en 'stories' y si no, en 'posts'
  const fetchOne = async (table: 'stories' | 'posts') =>
    supabase.from(table).select('*').eq('id', params.id).maybeSingle()

  let story: any = null
  let error: any = null

  let r = await fetchOne('stories')
  if (r.data) story = r.data; else error = r.error

  if (!story) {
    r = await fetchOne('posts')
    if (r.data) story = r.data; else error = r.error
  }

  if (!story && error) {
    return <div className="max-w-3xl mx-auto p-6 text-red-700">Error: {error.message}</div>
  }
  if (!story) return notFound()

  const content = story.content ?? story.body ?? story.text ?? story.description ?? ''

  const { data: comments } = await supabase
    .from('story_comments')
    .select('id, content, author_id, created_at')
    .eq('story_id', params.id)
    .order('created_at', { ascending: true })

  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
        <div className="text-sm text-gray-500 mb-4">
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
            {comments!.map(c => (
              <li key={c.id} className="border rounded bg-white p-3">
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(c.created_at as any).toLocaleString('es-CO')}
                </div>
                <div className="whitespace-pre-wrap">{c.content}</div>
              </li>
            ))}
          </ul>
        )}

        {session ? (
          <CommentForm storyId={params.id} />
        ) : (
          <p className="text-sm text-gray-600">Inicia sesión para comentar.</p>
        )}
      </section>
    </div>
  )
}
