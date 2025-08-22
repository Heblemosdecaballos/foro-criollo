// components/auth/RequireAuth.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/utils/supabase/client'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const run = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      setReady(true)
    }
    run()
  }, [router, pathname])

  if (!ready) return null // o un loader
  return <>{children}</>
}
