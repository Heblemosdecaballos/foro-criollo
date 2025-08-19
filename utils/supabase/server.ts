// app/logout/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const supabase = createSupabaseServer();

  // Cierra sesión (borra cookies sb-*)
  await supabase.auth.signOut();

  // Redirige a donde quieras. Intentamos tomar ?next=...
  const url = new URL(req.url);
  const next = url.searchParams.get('next') ?? '/';

  return NextResponse.redirect(new URL(next, req.url), { status: 302 });
}

// (Opcional) si también quieres permitir GET /logout
export async function GET(req: Request) {
  return POST(req);
}
