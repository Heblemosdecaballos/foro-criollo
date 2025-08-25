// src/app/api/hall/vote/route.ts
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
  return NextResponse.json({ ok: true, route: "/api/hall/vote" });
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
    const { hall_slug, media_id = null } = body ?? {};
    if (!hall_slug) return NextResponse.json({ error: "Falta hall_slug" }, { status: 400 });

    // Toggle “like”
    const { data: existing, error: findErr } = await supabase
      .from("hall_votes")
      .select("id")
      .eq("hall_slug", hall_slug)
      .eq("voter_id", user.id)
      .is("media_id", media_id)
      .maybeSingle();

    if (findErr) return NextResponse.json({ error: "DBError: " + findErr.message }, { status: 400 });

    if (existing) {
      const { error: delErr } = await supabase.from("hall_votes").delete().eq("id", existing.id);
      if (delErr) return NextResponse.json({ error: "DBError: " + delErr.message }, { status: 400 });
      return NextResponse.json({ toggled: "off" });
    } else {
      const { error: insErr } = await supabase.from("hall_votes").insert({
        hall_slug,
        media_id,
        voter_id: user.id,
        up: true,
      });
      if (insErr) return NextResponse.json({ error: "DBError: " + insErr.message }, { status: 400 });
      return NextResponse.json({ toggled: "on" });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "UnhandledError" }, { status: 500 });
  }
}
