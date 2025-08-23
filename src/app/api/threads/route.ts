import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supa = createSupabaseServerClientReadOnly();
  const { searchParams } = new URL(req.url);
  const sectionSlug = searchParams.get("section");

  let query = supa.from("threads").select("*, sections!inner(slug,title)").order("created_at", { ascending: false });
  if (sectionSlug) query = query.eq("sections.slug", sectionSlug);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ threads: data });
}

export async function POST(req: Request) {
  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { section_slug, title, body } = await req.json().catch(() => ({}));
  if (!section_slug || !title) return NextResponse.json({ error: "Faltan campos" }, { status: 400 });

  const { data: section } = await supa.from("sections").select("id").eq("slug", section_slug).single();
  if (!section) return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });

  await supa.from("profiles").upsert({ id: user.id, email: user.email ?? null });

  const { error } = await supa.from("threads").insert({
    section_id: section.id,
    author_id: user.id,
    title,
    body: body ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
