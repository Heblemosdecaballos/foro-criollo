'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { CATEGORIES } from '@/lib/utils'
import ThreadCard, { type Thread } from '@/components/ThreadCard'
import NewThreadDialog from '@/components/NewThreadDialog'
import { CatPill, Dialog } from '@/components/UI'
import { Bell, CalendarDays, Filter, Leaf, Plus, Search } from 'lucide-react'

export default function Page() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<'all'|typeof CATEGORIES[number]['id']>('all')
  const [sortBy, setSortBy] = useState<'recent'|'active'|'replies'>('recent')
  const [showOnlyToday, setShowOnlyToday] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('threads').select('*').order('created_at', { ascending: false }).limit(100)
      if (!error && data) setThreads(data as any)
    }
    load()
    const channel = supabase.channel('threads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filtered = useMemo(() => {
    let list = [...threads]
    if (activeCat !== 'all') list = list.filter(t => t.category === activeCat)
    if (showOnlyToday) {
      const iso = new Date().toISOString().slice(0,10)
      list = list.filter(t => t.open_today && (t.created_at || '').slice(0,10) <= iso)
    }
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(t => t.title.toLowerCase().includes(q) || (t.tags||[]).some(tag => tag.toLowerCase().includes(q)))
    }
    switch (sortBy) {
      case 'active': list.sort((a,b)=> +new Date(b.last_activity) - +new Date(a.last_activity)); break
      case 'replies': list.sort((a,b)=> (b.replies_count||0) - (a.replies_count||0)); break
      default: list.sort((a,b)=> +new Date(b.created_at) - +new Date(a.created_at));
    }
    return list
  }, [threads, query, activeCat, sortBy, showOnlyToday])

  const subscribeEmail = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return alert('Ingresa un correo válido')
    const { error } = await supabase.from('subscriptions').insert({ email })
    if (error && !String(error.message).includes('duplicate')) return alert(error.message)
    setEmail('')
    alert('¡Listo! Te notificaremos los foros abiertos cada día.')
  }

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-red-100" />
        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Leaf className="w-8 h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Foro Criollo Colombiano</h1>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <a className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-white shadow-sm hover:shadow transition" href="/login">Ingresar</a>
              <button className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-white shadow-sm hover:shadow transition" onClick={()=>setOpenDialog(true)}><Plus className="w-4 h-4" /> Crear tema</button>
              <button className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-white shadow-sm hover:shadow transition" onClick={()=>document.getElementById('subs')?.scrollIntoView({behavior:'smooth'})}><Bell className="w-4 h-4" /> Notificaciones</button>
            </div>
          </div>
          <p className="mt-3 text-neutral-700 max-w-3xl">Punto de encuentro para amantes, criadores, jinetes, aficionados y expertos del Caballo Criollo Colombiano. Aprende, debate, resuelve dudas y haz networking.</p>
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white pl-3 pr-2 py-2 shadow-sm">
              <Search className="w-4 h-4" />
              <input placeholder="Buscar temas, etiquetas…" value={query} onChange={e=>setQuery(e.target.value)} className="w-full outline-none bg-transparent"/>
              <button className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white text-sm">Buscar</button>
            </div>
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center gap-1 bg-white shadow-sm rounded-2xl px-2 py-1.5">
                <Filter className="w-4 h-4" />
                <select className="bg-transparent outline-none text-sm" value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
                  <option value="recent">Más recientes</option>
                  <option value="active">Más activos</option>
                  <option value="replies">Más respuestas</option>
                </select>
              </div>
              <label className="flex items-center gap-2 bg-white shadow-sm rounded-2xl px-3 py-1.5">
                <CalendarDays className="w-4 h-4" />
                <span className="text-sm">Foros de hoy</span>
                <input type="checkbox" checked={showOnlyToday} onChange={e=>setShowOnlyToday(e.target.checked)} className="accent-neutral-900"/>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-3">
          <CatPill active={activeCat==='all'} onClick={()=>setActiveCat('all')}>Todo</CatPill>
          {CATEGORIES.map(c=> <CatPill key={c.id} active={activeCat===c.id} onClick={()=>setActiveCat(c.id as any)}>{c.label}</CatPill>)}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-20 grid lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 space-y-3">
          <div className="text-sm text-neutral-600">{showOnlyToday? 'Foros abiertos hoy':'Todos los foros'}</div>
          {filtered.map(t=> <ThreadCard key={t.id} t={{ ...t, author: { name: 'Usuario', avatar: 'U' } }} />)}
          {filtered.length===0 && (
            <div className="bg-white rounded-2xl p-8 text-center border">
              <p className="text-neutral-700">No hay temas que coincidan con tu búsqueda.</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-neutral-900 text-white" onClick={()=>setOpenDialog(true)}><Plus className="w-4 h-4" /> Crear el primero</button>
            </div>
          )}
        </section>

        <aside className="lg:col-span-4 space-y-6">
          <div id="subs" className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5" /><h4 className="font-semibold">Notificaciones diarias por correo</h4>
            </div>
            <p className="text-sm text-neutral-600 mb-3">Recibe cada mañana el listado de foros abiertos del día.</p>
            <div className="flex items-center gap-2">
              <input className="bg-neutral-50 outline-none w-full text-sm px-3 py-2 rounded-xl border" placeholder="tu@correo.com" value={email} onChange={e=>setEmail(e.target.value)}/>
              <button className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-sm" onClick={subscribeEmail}>Guardar</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
            <div className="font-semibold mb-2">Anunciantes</div>
            <ul className="space-y-2 text-sm"><li className="rounded-xl border p-3">Silla & Montura Co. — Accesorios premium</li></ul>
          </div>
        </aside>
      </main>

      <Dialog onClose={()=>setOpenDialog(false)}>
        {openDialog && <NewThreadDialog onCreated={()=>setOpenDialog(false)} />}
      </Dialog>
    </div>
  )
}
