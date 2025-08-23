// app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supa() {
  const c = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get: n => c.get(n)?.value,
      set: (n, v, o) => { try { c.set({ name: n, value: v, ...o }); } catch {} },
      remove: (n, o) => { try { c.set({ name: n, value: "", ...o }); } catch {} }
    }
  });
}

// GET -> lista publicadas (público) | ?all=1 requiere login (RLS limita por autor)
export async function GET(req: NextRequest) {
  const db = supa();
  const all = new URL(req.url).searchParams.get("all") === "1";
  if (all) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
    const { data, error } = await db.from("news").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
  }
  const { data, error } = await db
    .from("news")
    .select("slug,title,excerpt,cover_url,created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

// POST -> crear noticia
export async function POST(req: NextRequest) {
  const db = supa();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { slug, title, excerpt, body, cover_url, published = true } = await req.json();
  if (!slug || !title || !body) return NextResponse.json({ error: "Campos incompletos" }, { status: 400 });

  const { error } = await db.from("news").insert({
    slug, title, excerpt: excerpt ?? null, body, cover_url: cover_url ?? null,
    published, author_id: user.id
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
