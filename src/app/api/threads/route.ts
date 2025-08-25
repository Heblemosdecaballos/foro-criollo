// src/app/api/threads/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supa = createSupabaseServerClientReadOnly();
  const url = new URL(req.url);
  const cat = url.searchParams.get("cat") || "";

  let q = supa.from("threads").select("*").order("created_at", { ascending: false });
  if (cat) q = q.eq("category", cat);

  const { data, error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, threads: data ?? [] });
}
