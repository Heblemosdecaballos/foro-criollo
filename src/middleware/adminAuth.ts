
// Middleware para verificar permisos de administrador
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function checkAdminAuth(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return req.cookies.get(name)?.value; },
          set() {}, // No-op for middleware
          remove() {}, // No-op for middleware
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Verificar rol de administrador
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return null; // Usuario autorizado
  } catch (error) {
    console.error('Error en verificación de admin:', error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}
