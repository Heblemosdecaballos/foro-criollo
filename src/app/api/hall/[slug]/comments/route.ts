// src/app/api/hall/[slug]/comments/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { content } = await req.json().catch(() => ({}));
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Contenido vacío" }, { status: 400 });
  }

  // asegurar profile
  await supa.from("profiles").upsert({ id: user.id, email: user.email ?? null });

  const { data: item } = await supa.from("hall_items").select("id").eq("slug", params.slug).single();
  if (!item) return NextResponse.json({ error: "Hall item no encontrado" }, { status: 404 });

  const { error } = await supa.from("hall_comments").insert({
    hall_id: item.id,
    author_id: user.id,
    content,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
