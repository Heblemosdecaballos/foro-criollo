
'use client'

import { useSupabase } from '@/components/providers'
import { useEffect, useState } from 'react'

export function SessionSync() {
  const { supabase, user } = useSupabase()
  const [syncAttempts, setSyncAttempts] = useState(0)

  useEffect(() => {
    const syncSession = async () => {
      try {
        console.log('[SessionSync] Syncing session with server...')
        
        // Forzar refresh de la sesión
        const { data, error } = await supabase.auth.refreshSession()
        
        if (error) {
          console.error('[SessionSync] Error refreshing session:', error)
          return
        }
        
        if (data.session) {
          console.log('[SessionSync] Session refreshed successfully:', data.session.user.email)
          
          // Forzar actualización de cookies en el servidor
          await fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token
            })
          })
        }
        
      } catch (error) {
        console.error('[SessionSync] Unexpected error:', error)
      }
    }

    // Sync on mount and when user changes
    if (user && syncAttempts < 3) {
      syncSession()
      setSyncAttempts(prev => prev + 1)
    }

    // Periodic sync every 5 minutes
    const interval = setInterval(() => {
      if (user) {
        syncSession()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [supabase, user, syncAttempts])

  return null // This component doesn't render anything
}
