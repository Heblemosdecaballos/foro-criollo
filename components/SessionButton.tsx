'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function SessionButton({ className = '' }: { className?: string }) {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  if (email) {
    return (
      <button onClick={logout} className={className}>
        Salir ({email})
      </button>
    )
  }

  return (
    <Link href="/login" className={className}>
      Ingresar
    </Link>
  )
}
