import { NextResponse } from 'next/server';
import { getSupabaseServer } from '../../../lib/supabaseServer';

export async function POST(req: Request) {
  const { postId, reason } = await req.json();
  if (!postId) return NextResponse.json({ error: 'postId requerido' }, { status: 400 });

  const supabase = getSupabaseServer();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { error } = await supabase.rpc('report_post', { p_post_id: postId, p_reason: reason ?? null });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
