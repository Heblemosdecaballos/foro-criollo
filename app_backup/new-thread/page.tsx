'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function NewThreadPage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return setMsg('Debes iniciar sesión.')
    }

    const { error } = await supabase.from('threads').insert({
      title,
      category,
      created_by: user.id,
    })

    setLoading(false)
    if (error) return setMsg(error.message)
    setMsg('Tema creado.')
    // window.location.href = '/'
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-3">
      <h1 className="text-xl font-semibold">Crear tema</h1>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <form onSubmit={onCreate} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Título"
               value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Categoría"
               value={category} onChange={e=>setCategory(e.target.value)} />
        <button disabled={loading} className="rounded bg-black text-white py-2 px-4">
          {loading ? 'Guardando...' : 'Publicar'}
        </button>
      </form>
    </main>
  )
}
