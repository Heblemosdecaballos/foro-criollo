// lib/supabaseClient.ts
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para el navegador (componentes cliente)
export function createClientBrowser() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// Cliente para el servidor (RSC, acciones, route handlers)
export function createClientServer() {
  const cookieStore = cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options)
      },
      remove(name: string, options: any) {
        cookieStore.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })
}
