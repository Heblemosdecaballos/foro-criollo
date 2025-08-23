// src/app/api/hall/[slug]/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const supa = createSupabaseServerClientReadOnly();

  const { data: item, error: e1 } = await supa
    .from("hall_items")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (e1 || !item) {
    return NextResponse.json({ error: e1?.message || "No encontrado" }, { status: 404 });
  }

  const [{ data: media }, { data: comments }] = await Promise.all([
    supa.from("hall_media").select("*").eq("hall_id", item.id).order("created_at", { ascending: false }),
    supa.from("hall_comments").select("*").eq("hall_id", item.id).order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({ item, media: media ?? [], comments: comments ?? [] });
}
