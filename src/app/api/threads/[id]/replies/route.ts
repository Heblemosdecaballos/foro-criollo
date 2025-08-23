import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { content } = await req.json().catch(() => ({}));
  if (!content?.trim()) return NextResponse.json({ error: "Contenido vacío" }, { status: 400 });

  await supa.from("profiles").upsert({ id: user.id, email: user.email ?? null });

  const { error } = await supa.from("replies").insert({
    thread_id: params.id,
    author_id: user.id,
    content,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
