// /app/api/threads/[id]/posts_tmp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServer();

  // 1) Verifica sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  // 2) Lee body del request
  const { body } = await req.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: "El cuerpo no puede estar vacío" }, { status: 400 });
  }

  // 3) Inserta el post
  const { error } = await supabase.from("posts").insert({
    thread_id: params.id,
    author_id: user.id,
    body,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
