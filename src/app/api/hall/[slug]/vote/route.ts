// src/app/api/hall/vote/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/src/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse("No autenticado", { status: 401 });

    const body = await req.json();
    const { hall_slug, media_id = null } = body;

    if (!hall_slug) return new NextResponse("Faltan campos", { status: 400 });

    // Toggle: si existe => delete; si no => insert
    const { data: existing, error: findErr } = await supabase
      .from("hall_votes")
      .select("id")
      .eq("hall_slug", hall_slug)
      .eq("voter_id", user.id)
      .is("media_id", media_id) // null => voto global
      .maybeSingle();

    if (findErr) return new NextResponse(findErr.message, { status: 400 });

    if (existing) {
      const { error: delErr } = await supabase
        .from("hall_votes")
        .delete()
        .eq("id", existing.id);
      if (delErr) return new NextResponse(delErr.message, { status: 400 });
      return NextResponse.json({ toggled: "off" });
    } else {
      const { error: insErr } = await supabase.from("hall_votes").insert({
        hall_slug,
        media_id, // null = voto global del hall
        voter_id: user.id,
        up: true,
      });
      if (insErr) return new NextResponse(insErr.message, { status: 400 });
      return NextResponse.json({ toggled: "on" });
    }
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Error", { status: 500 });
  }
}
