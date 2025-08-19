'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/utils/supabase/client'
import { getPublicBaseUrl } from '@/utils/base-url'

export default function AuthPage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signInWithGoogle = async () => {
    setError(null)
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getPublicBaseUrl()}/auth/callback?next=${encodeURIComponent(next)}`
      }
    })
  }

  const signInWithPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setError(error.message)
    router.push(next)
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>

      <button
        onClick={signInWithGoogle}
        className="w-full py-3 rounded bg-green-700 text-white mb-6"
        disabled={loading}
      >
        Continuar con Google
      </button>

      <div className="text-center text-sm text-gray-500 mb-4">o</div>

      <form onSubmit={signInWithPassword} className="space-y-3">
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <button
          type="submit"
          className="w-full py-3 rounded bg-gray-800 text-white"
          disabled={loading}
        >
          Entrar
        </button>
      </form>

      {error && <p className="text-red-600 mt-3">{error}</p>}
      <p className="text-xs text-gray-500 mt-6">
        Serás redirigido a: <code>{next}</code>
      </p>
    </main>
  )
}
