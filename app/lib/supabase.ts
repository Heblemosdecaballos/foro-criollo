
import { createClient } from '@supabase/supabase-js'

// ✅ VERSIÓN DE EMERGENCIA - GRACEFUL FALLBACK PARA TESTING  
function getEnvVars() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // EMERGENCY FALLBACK: Use dummy values to test if app loads without crashing
  const finalUrl = supabaseUrl || 'https://dummy-project.supabase.co'
  const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy-key-for-testing.emergency'
  
  console.log('🔧 EMERGENCY MODE - Checking env vars:')
  console.log('  - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ SET' : '❌ MISSING')
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ SET' : '❌ MISSING')
  console.log('  - Using URL:', finalUrl)
  console.log('  - Using Key:', finalKey.substring(0, 30) + '...')
  
  return { 
    supabaseUrl: finalUrl, 
    supabaseAnonKey: finalKey 
  }
}

// ✅ ARQUITECTURA SSR ROBUSTA Y ERROR-RESISTANT

// Cliente para el navegador (client-side)
export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnvVars()
  
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
  const { supabaseUrl, supabaseAnonKey } = getEnvVars()
  
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
  const { supabaseUrl, supabaseAnonKey } = getEnvVars()
  
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
  const { supabaseUrl } = getEnvVars()
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
export const supabase = (() => {
  try {
    const { supabaseUrl, supabaseAnonKey } = getEnvVars()
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.warn('⚠️ Failed to create legacy supabase client:', error)
    return null as any // Evitar crashes en importaciones existentes
  }
})()

export const createServerSupabaseClientWithCookies = createServerSupabaseClient
