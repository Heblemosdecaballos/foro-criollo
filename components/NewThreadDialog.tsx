'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { CATEGORIES } from '@/lib/utils'

export default function NewThreadDialog({ onCreated }: { onCreated?: ()=>void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('debate')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const author_id = user?.id ?? null
    const tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean)
    const { error } = await supabase.from('threads').insert({ title, category, tags: tagsArr, author_id })
    setLoading(false)
    if (error) return alert(error.message)
    setTitle(''); setTags(''); setCategory('debate')
    onCreated?.()
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <h3 className="text-lg font-semibold">Crear nuevo tema</h3>
      <div className="grid gap-2">
        <label className="text-sm">Título</label>
        <input className="rounded-xl border px-3 py-2 outline-none focus:ring-2 ring-neutral-900/20" required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ej. ¿Cómo mejorar el ritmo sin perder comodidad?"/>
      </div>
      <div className="grid gap-2">
        <label className="text-sm">Categoría</label>
        <select className="rounded-xl border px-3 py-2 outline-none focus:ring-2 ring-neutral-900/20" value={category} onChange={e=>setCategory(e.target.value)}>
          {CATEGORIES.map(c=> <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm">Etiquetas (separadas por coma)</label>
        <input className="rounded-xl border px-3 py-2 outline-none focus:ring-2 ring-neutral-900/20" value={tags} onChange={e=>setTags(e.target.value)} placeholder="salud, paso fino, genética"/>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <button type="submit" className="px-4 py-2 rounded-xl bg-neutral-900 text-white" disabled={loading}>{loading? 'Publicando…':'Publicar tema'}</button>
      </div>
    </form>
  )
}
