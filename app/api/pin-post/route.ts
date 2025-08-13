import { NextResponse } from 'next/server';
import { getSupabaseServer } from '../../../lib/supabaseServer';

export async function POST(req: Request) {
  const { threadId, postId } = await req.json();
  if (!threadId || !postId) return NextResponse.json({ error: 'threadId y postId requeridos' }, { status: 400 });

  const supabase = getSupabaseServer();

  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { error } = await supabase.rpc('mod_pin_post', { p_thread_id: threadId, p_post_id: postId });
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  return NextResponse.json({ ok: true });
}
