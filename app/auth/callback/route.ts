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
  // Fija sb-... en tu dominio (httpOnly)
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(new URL(next, url.origin), { status: 302 });
}

export async function POST(req: Request) {
  // Mantiene/limpia cookies cuando cambie el estado de auth
  const supabase = createRouteHandlerClient({ cookies });
  const { event } = await req.json();

  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    await supabase.auth.signOut({ scope: 'local' }); // borra sb-...
  }
  return new Response(null, { status: 204 });
}
