
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ ARQUITECTURA SSR SIMPLIFICADA Y COMPATIBLE

// Cliente para el navegador (client-side)
export function createBrowserSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      flowType: 'pkce',
      detectSessionInUrl: true
    }
  })
}

// Cliente para el servidor (server-side) - Simplificado para máxima compatibilidad
export async function createServerSupabaseClient() {
  // Por ahora usar configuración simplificada que no cause problemas de tipos
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      flowType: 'pkce'
    }
  })
}

// Cliente para middleware
export function createMiddlewareSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      flowType: 'pkce'
    }
  })
}

// Cliente admin para operaciones de backend
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE is required for admin operations')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// DEPRECATED - Mantener solo para compatibilidad temporal
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const createServerSupabaseClientWithCookies = createServerSupabaseClient
