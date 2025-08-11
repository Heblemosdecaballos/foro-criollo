'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Flame, Lock, Unlock, CalendarDays, Trash2 } from 'lucide-react'

type Thread = {
  id: string
  title: string
  category: string
  created_at: string
  hot: boolean
  status: 'open'|'archived'
  open_today: boolean
}

export default function AdminPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [name, setName] = useState('')
  const [blurb, setBlurb] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const load = async () => {
      const { data } = await supabase.from('threads').select('id,title,category,created_at,hot,status,open_today').order('created_at', { ascending: false }).limit(100)
      setThreads((data||[]) as any)
    }
    load()
  }, [])

  const toggle = async (id: string, field: 'hot'|'open_today'|'status') => {
    const t = threads.find(x=>x.id===id)!
    const patch: any = {}
    if (field==='hot') patch.hot = !t.hot
    if (field==='open_today') patch.open_today = !t.open_today
    if (field==='status') patch.status = t.status === 'open' ? 'archived' : 'open'
    const { error } = await supabase.from('threads').update(patch).eq('id', id)
    if (error) return alert(error.message)
    setThreads(prev => prev.map(x => x.id===id ? {...x, ...patch} : x))
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar el hilo y sus respuestas?')) return
    const { error } = await supabase.from('threads').delete().eq('id', id)
    if (error) return alert(error.message)
    setThreads(prev => prev.filter(x=>x.id!==id))
  }

  const addSponsor = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('sponsors').insert({ name, blurb, url })
    setLoading(false)
    if (error) return alert(error.message)
    setName(''); setBlurb(''); setUrl('')
    alert('Anunciante agregado')
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold">Panel de Moderación</h1>
      <p className="text-neutral-600 mb-4">Solo para administradores. Si no tienes permisos, verás errores al actualizar.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="font-semibold mb-3">Hilos</h2>
          <ul className="space-y-3">
            {threads.map(t => (
              <li key={t.id} className="border rounded-xl p-3">
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-neutral-600">{t.category} · {new Date(t.created_at).toLocaleString('es-CO')}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button className="px-3 py-1.5 text-sm rounded-xl border" onClick={()=>toggle(t.id, 'hot')}><Flame className="w-4 h-4 inline mr-1" /> {t.hot ? 'Quitar tendencia' : 'Poner en tendencia'}</button>
                  <button className="px-3 py-1.5 text-sm rounded-xl border" onClick={()=>toggle(t.id, 'status')}>{t.status==='open' ? <Lock className="w-4 h-4 inline mr-1" /> : <Unlock className="w-4 h-4 inline mr-1" />} {t.status==='open' ? 'Archivar' : 'Reabrir'}</button>
                  <button className="px-3 py-1.5 text-sm rounded-xl border" onClick={()=>toggle(t.id, 'open_today')}><CalendarDays className="w-4 h-4 inline mr-1" /> {t.open_today ? 'Quitar de hoy' : 'Marcar “de hoy”'}</button>
                  <button className="px-3 py-1.5 text-sm rounded-xl border text-red-600" onClick={()=>remove(t.id)}><Trash2 className="w-4 h-4 inline mr-1" /> Eliminar</button>
                </div>
              </li>
            ))}
            {threads.length===0 && <li className="text-sm text-neutral-600">No hay hilos aún.</li>}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="font-semibold mb-3">Anunciantes</h2>
          <form onSubmit={addSponsor} className="space-y-2">
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} required />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Descripción" value={blurb} onChange={e=>setBlurb(e.target.value)} />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="URL" value={url} onChange={e=>setUrl(e.target.value)} />
            <button disabled={loading} className="px-4 py-2 rounded-xl bg-neutral-900 text-white">{loading ? 'Agregando…' : 'Agregar anunciante'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
