import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export async function GET() {
  const supa = createSupabaseServerClientReadOnly();
  const { data, error } = await supa.from("story_posts").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: Request) {
  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { title, content, media_path } = await req.json().catch(() => ({}));
  if (!title?.trim()) return NextResponse.json({ error: "Título requerido" }, { status: 400 });

  await supa.from("profiles").upsert({ id: user.id, email: user.email ?? null });

  const { error } = await supa.from("story_posts").insert({
    author_id: user.id, title, content: content ?? null, media_path: media_path ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
