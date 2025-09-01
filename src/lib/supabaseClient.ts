// /src/lib/supabaseClient.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Si las credenciales son de demo/placeholder, lanzar error controlado
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl.includes('demo-project') || 
      supabaseUrl.includes('example') ||
      supabaseAnonKey.includes('demo-key') ||
      supabaseAnonKey.includes('placeholder')) {
    throw new Error('Supabase credentials not properly configured for production');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();
