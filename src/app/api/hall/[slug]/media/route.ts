// src/app/api/hall/media/route.ts
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
    const { hall_slug, type, url, storage_path, caption, author_name } = body;

    if (!hall_slug || !type || !url) {
      return new NextResponse("Faltan campos", { status: 400 });
    }

    const { data, error } = await supabase
      .from("hall_media")
      .insert({
        hall_slug,
        type, // "image" | "video" | "youtube"
        url,  // público o URL de YouTube
        storage_path: storage_path ?? null, // null para youtube
        caption: caption ?? null,
        author_id: user.id,
        author_name:
          author_name ?? user.user_metadata?.full_name ?? user.email,
      })
      .select()
      .single();

    if (error) return new NextResponse(error.message, { status: 400 });

    return NextResponse.json(data);
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Error", { status: 500 });
  }
}
