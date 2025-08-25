// src/app/api/threads/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const revalidate = 0; // no cache

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cat = searchParams.get("cat") || undefined;

    const supa = createSupabaseServerClient();

    let q = supa
      .from("threads")
      .select(
        "id,title,category,tags,author_id,created_at,replies_count,views,hot,open_today,last_activity,status,created_by,pinned_post_id"
      )
      .order("last_activity", { ascending: false });

    if (cat) q = q.eq("category", cat);

    const { data, error } = await q;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, threads: data || [] }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message || "Unexpected error" },
      { status: 500 }
    );
  }
}
