import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Llega desde Google (o el proveedor): fija las cookies httpOnly con el "code".
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (!code) return NextResponse.redirect(new URL(next, url.origin));

  const supabase = createRouteHandlerClient({ cookies });
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(new URL(next, url.origin), { status: 302 });
}

// Llega desde el listener del cliente: regraba/actualiza cookies en eventos seguros.
export async function POST(req: Request) {
  const { event, session } = (await req.json()) as {
    event:
      | 'INITIAL_SESSION'
      | 'SIGNED_IN'
      | 'SIGNED_OUT'
      | 'PASSWORD_RECOVERY'
      | 'TOKEN_REFRESHED'
      | 'USER_UPDATED';
    session: Session | null;
  };

  const supabase = createRouteHandlerClient({ cookies });

  // Solo reescribimos cookies cuando hay sesión válida
  if (
    (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
    session
  ) {
    // setSession regraba las cookies httpOnly con el access/refresh vigentes
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  }

  // NO llamamos a supabase.auth.signOut() aquí.
  // El borrado de cookies solo debe ocurrir en /logout.
  return new Response(null, { status: 204 });
}
