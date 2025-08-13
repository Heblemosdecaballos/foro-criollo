import { NextResponse } from 'next/server';
import { getSupabaseServer } from '../../../lib/supabaseServer';

export async function POST(req: Request) {
  const { threadId } = await req.json();
  if (!threadId) return NextResponse.json({ error: 'threadId requerido' }, { status: 400 });

  const supabase = getSupabaseServer();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { error } = await supabase.rpc('mod_unpin_thread', { p_thread_id: threadId });
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  return NextResponse.json({ ok: true });
}
