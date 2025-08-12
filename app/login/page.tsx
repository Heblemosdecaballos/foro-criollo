import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const next = search.get('next') ?? '/'

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(next)
    })
  }, [next, router])

  const doSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setMsg(error.message)
    router.replace(next)
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Ingresar</h1>

      {msg && <p className="text-red-600">{msg}</p>}

      <form onSubmit={doSignIn} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-black text-white py-2 rounded" type="submit">
          Entrar
        </button>
      </form>

      <p className="text-sm">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="underline">
          Crear cuenta
        </Link>
      </p>
    </main>
  )
}
