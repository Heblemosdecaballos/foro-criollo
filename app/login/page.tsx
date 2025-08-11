'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: typeof window !== 'undefined' ? `${location.origin}/` : undefined } })
    if (error) alert(error.message)
    else setSent(true)
  }
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={sendLink} className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-md space-y-3 border">
        <h1 className="text-xl font-semibold">Ingresa a Foro Criollo</h1>
        <input className="w-full rounded-xl border px-3 py-2" type="email" placeholder="tu@correo.com" value={email} onChange={e=>setEmail(e.target.value)} required />
        <button className="w-full rounded-xl bg-neutral-900 text-white py-2">Enviar enlace de acceso</button>
        {sent && <p className="text-sm text-emerald-700">Revisa tu correo para el enlace mágico.</p>}
      </form>
    </div>
  )
}
