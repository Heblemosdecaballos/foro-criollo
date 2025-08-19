// components/auth/SessionListener.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/utils/supabase/browser'

export default function SessionListener() {
  const router = useRouter()

  useEffect(() => {
    const supabase = supabaseBrowser()

    // Cuando cambie la sesión (login/logout/refresh), refrescamos la UI
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.refresh()
    })

    return () => subscription?.unsubscribe()
  }, [router])

  return null
}
