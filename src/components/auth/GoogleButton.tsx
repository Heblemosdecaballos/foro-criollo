// components/auth/GoogleButton.tsx
'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/utils/supabase/client'

export default function GoogleButton({ next = '/' }: { next?: string }) {
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    setLoading(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: { prompt: 'consent' } // fuerza selector de cuenta
        }
      })
      if (error) throw error
      // Redirecciona Google → callback → tu "next"
    } catch (e: any) {
      alert(e.message ?? 'Error iniciando con Google')
      setLoading(false)
    }
  }

  return (
    <button onClick={onClick} disabled={loading}>
      {loading ? 'Conectando…' : 'Continuar con Google'}
    </button>
  )
}
