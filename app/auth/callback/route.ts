// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  const supabase = createRouteHandlerClient({ cookies });

  if (code) {
    // Intercambia el code por sesión y deja la cookie en TU dominio
    await supabase.auth.exchangeCodeForSession(code);
  }

  // redirige a donde el usuario quería ir (ej. /historias/nueva)
  return NextResponse.redirect(new URL(next, req.url).toString(), 302);
}
