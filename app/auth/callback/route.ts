// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const supabase = createSupabaseServer();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Si hay error, vuelve al login
      return NextResponse.redirect(new URL('/login?error=oauth', request.url));
    }
  }

  // ✅ Aquí ya están los cookies sb-… seteados por el server helper
  return NextResponse.redirect(new URL('/historias/nueva', request.url));
}
