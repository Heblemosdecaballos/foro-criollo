// src/app/api/threads/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supa = createClient(supabaseUrl, anonKey);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cat = url.searchParams.get("cat") || "";

    let q = supa.from("threads").select("*").order("created_at", { ascending: false });
    if (cat) q = q.eq("category", cat);

    const { data, error } = await q;
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, threads: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
