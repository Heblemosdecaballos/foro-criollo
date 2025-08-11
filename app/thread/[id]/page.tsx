'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Flame, CalendarDays } from 'lucide-react'
import PostList from '@/components/PostList'

type ThreadRow = {
  id: string
  title: string
  category: string
  tags: string[]
  created_at: string
  replies_count: number
  views: number
  hot: boolean
  open_today: boolean
  last_activity: string
  status: string
}

export default function ThreadPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || ''
  const [t, setT] = useState<ThreadRow | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const { data, error } = await supabase.from('threads').select('*').eq('id', id).single()
      if (!error && data) setT(data as any)
    }
    load()
    const channel = supabase.channel('thread-one')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'threads', filter: `id=eq.${id}` }, (p)=>{
        setT((prev)=> prev ? { ...prev, ...(p.new as any) } : (p.new as any))
      })
      .subscribe()
    fetch(`/api/threads/${id}/view`, { method: 'POST' }).catch(()=>{})
    return () => { supabase.removeChannel(channel) }
  }, [id])

  if (!t) return <div className="max-w-4xl mx-auto p-4">Cargando…</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button onClick={()=>router.back()} className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="bg-white rounded-2xl p-5 shadow-sm border mt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100">{t.category}</span>
          {t.hot && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800"><Flame className="w-3 h-3" /> Tendencia</span>}
          {t.open_today && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"><CalendarDays className="w-3 h-3" /> Hoy</span>}
          {t.status === 'archived' && <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200">Archivado</span>}
        </div>
        <h1 className="mt-2 text-2xl font-semibold">{t.title}</h1>
        <div className="text-sm text-neutral-600 mt-1">
          Publicado el {new Date(t.created_at).toLocaleString('es-CO')} · {t.replies_count} respuestas · {t.views} vistas
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          {(t.tags||[]).map(tag => <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-neutral-50 border">{tag}</span>)}
        </div>
      </div>

      <PostList threadId={id} archived={t.status==='archived'} />
    </div>
  )
}
