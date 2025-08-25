// src/app/api/hall/media/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET() {
  // Handler de diagnóstico simple: NO toca la base
  return NextResponse.json({ ok: true, route: "/api/hall/media" });
}

export async function POST(req: Request) {
  const supabase = createSupabaseServer();

  try {
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) return NextResponse.json({ error: "AuthError: " + authErr.message }, { status: 401 });
    if (!user)   return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const body = await req.json();
    const { hall_slug, type, url, storage_path, caption, author_name } = body ?? {};
    if (!hall_slug) return NextResponse.json({ error: "Falta hall_slug" }, { status: 400 });
    if (!type)     return NextResponse.json({ error: "Falta type (image|video|youtube)" }, { status: 400 });
    if (!url)      return NextResponse.json({ error: "Falta url" }, { status: 400 });

    // Validar que el hall exista (feedback claro)
    const { data: hall, error: hallErr } = await supabase
      .from("halls")
      .select("slug")
      .eq("slug", hall_slug)
      .single();

    if (hallErr || !hall) {
      return NextResponse.json({ error: `Hall no encontrado para slug=${hall_slug}` }, { status: 400 });
    }

    // Insert SIN .single() para evitar el error “coerce”
    const { data, error } = await supabase
      .from("hall_media")
      .insert({
        hall_slug,
        type,
        url,
        storage_path: storage_path ?? null,
        caption: caption ?? null,
        author_id: user.id,
        author_name: author_name ?? user.user_metadata?.full_name ?? user.email,
      })
      .select(); // array

    if (error) return NextResponse.json({ error: "DBError: " + error.message }, { status: 400 });

    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json(row ?? { ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "UnhandledError" }, { status: 500 });
  }
}
