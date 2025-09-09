
'use client'

import { createBrowserSupabaseClient } from '@/lib/supabase'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session, SupabaseClient } from '@supabase/supabase-js'
import { ThemeProvider } from './theme-provider'

// ✅ NUEVA ARQUITECTURA DE CONTEXTO

type SupabaseContext = {
  supabase: SupabaseClient
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
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
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ Funciones de autenticación centralizadas
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [supabase])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [supabase])

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    return { error }
  }, [supabase])

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('❌ Error obteniendo sesión inicial:', error)
        } else {
          console.log('🔐 Sesión inicial:', session?.user ? `✅ ${session.user.email}` : '❌ No autenticado')
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('❌ Error crítico al obtener sesión:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // ✅ Escuchar cambios de estado de autenticación con logging mejorado
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔐 Auth Event: ${event}`, session?.user ? `✅ ${session.user.email}` : '❌ No user')
      
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      // Manejar eventos específicos
      switch (event) {
        case 'SIGNED_IN':
          console.log('✅ Usuario autenticado exitosamente')
          break
        case 'SIGNED_OUT':
          console.log('🚪 Usuario desconectado, redirigiendo...')
          setTimeout(() => {
            window.location.href = '/'
          }, 100)
          break
        case 'TOKEN_REFRESHED':
          console.log('🔄 Token renovado exitosamente')
          break
      }
    })

    return () => {
      console.log('🔌 Desconectando suscripción de auth')
      subscription.unsubscribe()
    }
  }, [supabase])

  const value = {
    supabase,
    user,
    session,
    isLoading,
    signIn,
    signOut,
    signUp
  }

  return (
    <Context.Provider value={value}>
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
