// src/app/api/hof/horses/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = createSupabaseServer();
  const { searchParams } = new URL(req.url);
  const hall_slug = searchParams.get("hall_slug");
  if (!hall_slug) return NextResponse.json({ error: "Falta hall_slug" }, { status: 400 });

  const { data, error } = await supabase
    .from("hall_horses")
    .select("id, slug, name, owner_name, created_at")
    .eq("hall_slug", hall_slug)
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: "DBError: " + error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { hall_slug, name, owner_name } = await req.json();
  if (!hall_slug || !name) return NextResponse.json({ error: "Falta hall_slug o name" }, { status: 400 });

  const slug = name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data, error } = await supabase
    .from("hall_horses")
    .insert({
      hall_slug,
      name,
      owner_name: owner_name ?? null,
      slug,
      created_by: user.id,
    })
    .select(); // array

  if (error) return NextResponse.json({ error: "DBError: " + error.message }, { status: 400 });
  return NextResponse.json(Array.isArray(data) ? data[0] : data, { status: 201 });
}
