// src/app/api/hall/[slug]/media/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { storage_path, media_type } = body || {};

  if (!storage_path || !media_type) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const { data: item } = await supa.from("hall_items").select("id").eq("slug", params.slug).single();
  if (!item) return NextResponse.json({ error: "Hall item no encontrado" }, { status: 404 });

  const { error } = await supa.from("hall_media").insert({
    hall_id: item.id,
    storage_path,       // ej: "hall/2025/08/file.mp4"
    media_type,         // "image" | "video"
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
