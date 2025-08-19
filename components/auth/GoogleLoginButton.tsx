// components/auth/GoogleButton.tsx
'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/utils/supabase/browser'

type Props = { next?: string }

export default function GoogleButton({ next = '/' }: Props) {
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    const supabase = supabaseBrowser()
    const origin = window.location.origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://hablandodecaballos.com'

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        // (opcional) fuerza refresh_token
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    })
  }

  return (
    <button onClick={handle} disabled={loading}>
      {loading ? 'Conectando…' : 'Continuar con Google'}
    </button>
  )
}
