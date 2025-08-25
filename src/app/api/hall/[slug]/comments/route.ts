// src/app/api/hall/comment/route.ts
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
  return NextResponse.json({ ok: true, route: "/api/hall/comment" });
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
    const { hall_slug, content, author_name } = body ?? {};
    if (!hall_slug) return NextResponse.json({ error: "Falta hall_slug" }, { status: 400 });
    if (!content?.trim()) return NextResponse.json({ error: "Falta content" }, { status: 400 });

    const { data, error } = await supabase
      .from("hall_comments")
      .insert({
        hall_slug,
        content,
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
