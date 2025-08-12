'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function onLogin(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setMsg(error.message)
    setMsg('¡Listo! Ya estás dentro.')
    // window.location.href = '/'  // si quiere, redirigir
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return setMsg(error.message)
    setMsg('Cuenta creada. Ahora puedes iniciar sesión.')
  }

  return (
    <main className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Ingresar</h1>

      {msg && <p className="text-sm text-red-600">{msg}</p>}

      <form onSubmit={onLogin} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Correo"
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
        <button className="w-full rounded bg-black text-white py-2">Ingresar</button>
      </form>

      <form onSubmit={onSignup} className="space-y-3">
        <h2 className="font-medium">Crear cuenta</h2>
        <input
          className="w-full border rounded p-2"
          placeholder="Correo"
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
        <button className="w-full rounded border py-2">Registrarme</button>
      </form>

      <Link href="/">Volver</Link>
    </main>
  )
}
