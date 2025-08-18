import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';

  const supabase = createRouteHandlerClient({ cookies });

  if (code) {
    await supabase.auth.exchangeCodeForSession(code); // <- fija cookie sb-... en TU dominio
  }

  return NextResponse.redirect(new URL(next, url.origin), { status: 302 });
}
