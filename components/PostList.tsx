import { supabase } from '@/lib/supabaseClient'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Post = {
  id: string
  thread_id: string
  author_id: string | null
  content: string
  created_at: string
}

export default function PostList({ threadId, archived }: { threadId: string; archived?: boolean }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(()=>{
    const load = async ()=> {
      const { data } = await supabase.from('posts').select('*').eq('thread_id', threadId).order('created_at', { ascending: true })
      setPosts((data||[]) as any)
    }
    load()
    const channel = supabase.channel('posts-'+threadId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts', filter: `thread_id=eq.${threadId}` }, (p)=>{
        setPosts(prev => [...prev, p.new as any])
      })
      .subscribe()
    return ()=> { supabase.removeChannel(channel) }
  }, [threadId])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const author_id = user?.id ?? null
    const { error } = await supabase.from('posts').insert({ thread_id: threadId, content, author_id })
    setLoading(false)
    if (error) return alert(error.message)
    setContent('')
    formRef.current?.reset()
  }

  return (
    <div className="mt-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border">
        <h3 className="font-semibold mb-3">Respuestas</h3>
        <ul className="space-y-4">
          {posts.map(p => (
            <li key={p.id} className="border rounded-xl p-3 bg-neutral-50">
              <div className="text-sm text-neutral-600">{new Date(p.created_at).toLocaleString('es-CO')}</div>
              <div className="mt-1 whitespace-pre-wrap">{p.content}</div>
            </li>
          ))}
          {posts.length === 0 && <li className="text-neutral-600 text-sm">Aún no hay respuestas. ¡Sé el primero en participar!</li>}
        </ul>

        {!archived && (
          <form ref={formRef} onSubmit={onSubmit} className="mt-4 space-y-2">
            <textarea className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ring-neutral-900/20 min-h-[90px]" placeholder="Escribe tu respuesta… (debes estar autenticado con Magic Link)" value={content} onChange={e=>setContent(e.target.value)} />
            <div className="flex justify-end">
              <button disabled={loading} className="px-4 py-2 rounded-xl bg-neutral-900 text-white">{loading ? 'Publicando…' : 'Publicar respuesta'}</button>
            </div>
          </form>
        )}

        {archived && <div className="mt-3 text-sm text-neutral-600">Este tema está archivado. No admite nuevas respuestas.</div>}
      </div>
    </div>
  )
}
