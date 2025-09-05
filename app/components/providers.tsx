
'use client'

import { createBrowserSupabaseClient } from '@/lib/supabase'
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { ThemeProvider } from './theme-provider'
import type { Session } from '@supabase/supabase-js'

type SupabaseContext = {
  supabase: ReturnType<typeof createBrowserSupabaseClient>
  user: User | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function useSupabase() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createBrowserSupabaseClient())
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error obteniendo sesión inicial:', error)
        } else {
          console.log('Sesión inicial:', session?.user ? 'Usuario logueado' : 'No hay usuario')
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error al obtener sesión:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios de estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      console.log('Cambio de estado de auth:', event, session?.user ? 'Usuario logueado' : 'No hay usuario')
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      // Solo recargar en logout para limpiar completamente el estado
      if (event === 'SIGNED_OUT') {
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <Context.Provider value={{ supabase, user }}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </Context.Provider>
  )
}
