// src/app/api/hall/media/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/src/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createSupabaseServer();

  try {
    // 1) Auth
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) {
      console.error("[media] auth.getUser error:", authErr);
      return NextResponse.json({ error: "AuthError: " + authErr.message }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 2) Body
    const body = await req.json();
    const { hall_slug, type, url, storage_path, caption, author_name } = body ?? {};

    if (!hall_slug) return NextResponse.json({ error: "Falta hall_slug" }, { status: 400 });
    if (!type) return NextResponse.json({ error: "Falta type (image|video|youtube)" }, { status: 400 });
    if (!url) return NextResponse.json({ error: "Falta url" }, { status: 400 });

    // 3) Hall existe (evita FK fallando silenciosamente)
    const { data: hall, error: hallErr } = await supabase
      .from("halls")
      .select("slug")
      .eq("slug", hall_slug)
      .single();

    if (hallErr || !hall) {
      console.error("[media] hall not found:", hallErr);
      return NextResponse.json({ error: `Hall no encontrado para slug=${hall_slug}` }, { status: 400 });
    }

    // 4) Insert
    const { data, error } = await supabase
      .from("hall_media")
      .insert({
        hall_slug,
        type,                       // 'image' | 'video' | 'youtube'
        url,                        // public URL o YouTube URL
        storage_path: storage_path ?? null,
        caption: caption ?? null,
        author_id: user.id,         // RLS: debe permitir auth.uid() = author_id
        author_name: author_name ?? user.user_metadata?.full_name ?? user.email,
      })
      .select()
      .single();

    if (error) {
      console.error("[media] insert error:", error);
      return NextResponse.json({ error: "DBError: " + error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    console.error("[media] unhandled error:", e);
    // Siempre devolver JSON para que el cliente muestre detalle
    return NextResponse.json({ error: e?.message ?? "UnhandledError" }, { status: 500 });
  }
}
