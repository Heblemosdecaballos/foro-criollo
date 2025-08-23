// src/app/api/hall/[slug]/vote/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServerClientReadOnly,
} from "@/utils/supabase/server";

export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Buscar item del Hall
  const { data: item, error: e1 } = await supa
    .from("hall_items")
    .select("id")
    .eq("slug", params.slug)
    .single();
  if (e1 || !item) return NextResponse.json({ error: "Hall item no encontrado" }, { status: 404 });

  // ¿Ya votó?
  const { data: existing } = await supa
    .from("hall_votes")
    .select("id")
    .eq("hall_id", item.id)
    .eq("user_id", user.id)
    .maybeSingle();

  let voted: boolean;
  if (existing?.id) {
    // Quitar voto
    const { error } = await supa.from("hall_votes").delete().eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    voted = false;
  } else {
    // Dar voto
    const { error } = await supa
      .from("hall_votes")
      .insert({ hall_id: item.id, user_id: user.id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    voted = true;
  }

  // Contar
  const ro = createSupabaseServerClientReadOnly();
  const { count } = await ro
    .from("hall_votes")
    .select("*", { count: "exact", head: true })
    .eq("hall_id", item.id);

  return NextResponse.json({ voted, count: count ?? 0 });
}
