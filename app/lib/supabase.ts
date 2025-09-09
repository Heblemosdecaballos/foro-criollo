
import { createClient } from '@supabase/supabase-js'

// ✅ CONFIGURACIÓN ROBUSTA DE VARIABLES DE ENTORNO
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificación de variables críticas
if (!supabaseUrl) {
  console.error('❌ FALTA: NEXT_PUBLIC_SUPABASE_URL no configurada')
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Please configure it in Vercel Environment Variables.')
}

if (!supabaseAnonKey) {
  console.error('❌ FALTA: NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada')
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please configure it in Vercel Environment Variables.')
}

console.log('✅ Supabase configurado correctamente:', supabaseUrl)

// ✅ ARQUITECTURA SSR ROBUSTA Y ERROR-RESISTANT

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
    console.error('❌ FALTA: SUPABASE_SERVICE_ROLE no configurada para operaciones admin')
    throw new Error('SUPABASE_SERVICE_ROLE is required for admin operations. Please configure it in Vercel Environment Variables.')
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
