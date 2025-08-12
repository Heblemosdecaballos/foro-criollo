import { supabase } from '@/lib/supabaseClient'
import { MessageSquare, Users, Flame, CalendarDays, Tag } from 'lucide-react'
import { AvatarText } from './UI'
import { CATEGORIES } from '@/lib/utils'

export type Thread = {
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
  author: { name: string; avatar: string } | null
}

export default function ThreadCard({ t }: { t: Thread }) {
  const label = CATEGORIES.find(c => c.id === t.category)?.label || t.category
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition border border-neutral-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
           <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-700">
  {label ?? t.category}
</span>
            {t.hot && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800"><Flame className="w-3 h-3" /> Tendencia</span>}
            {t.open_today && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"><CalendarDays className="w-3 h-3" /> Hoy</span>}
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-tight truncate">{t.title}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
            <AvatarText text={t.author?.avatar ?? 'U'} /><span>{t.author?.name ?? 'Usuario'}</span><span>•</span><span>{new Date(t.created_at).toLocaleString('es-CO')}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {(t.tags||[]).map((tag) => <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-neutral-100"><Tag className="w-3 h-3" /> {tag}</span>)}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-neutral-600">
          <div className="flex items-center gap-1 text-sm"><Users className="w-4 h-4" /> {Math.max(1, Math.ceil((t.replies_count||0)/3))}</div>
          <div className="flex items-center gap-1 text-sm"><MessageSquare className="w-4 h-4" /> {t.replies_count||0}</div>
          <a className="rounded-xl px-3 py-1.5 border text-sm hover:bg-neutral-50" href={`/thread/${t.id}`}>Abrir</a>
        </div>
      </div>
    </div>
  )
}
