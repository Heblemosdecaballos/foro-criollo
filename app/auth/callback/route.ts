// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  const supabase = createRouteHandlerClient({ cookies });
  await supabase.auth.exchangeCodeForSession(code); // fija sb-... en tu dominio

  return NextResponse.redirect(new URL(next, url.origin), { status: 302 });
}

export async function POST(req: Request) {
  // Recibe eventos del listener del cliente para mantener/limpiar cookies httpOnly
  const supabase = createRouteHandlerClient({ cookies });
  const { event } = await req.json();

  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    await supabase.auth.signOut({ scope: 'local' }); // borra las sb-...
  }
  // No limpiamos en INITIAL_SESSION; evitamos “borrados fantasma”
  return new Response(null, { status: 204 });
}
