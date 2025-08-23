// app/api/pages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supa() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get: (n) => cookieStore.get(n)?.value,
      set: (n, v, o) => { try { cookieStore.set({ name: n, value: v, ...o }); } catch {} },
      remove: (n, o) => { try { cookieStore.set({ name: n, value: "", ...o }); } catch {} }
    }
  });
}

// GET /api/pages            -> lista publicadas (público)
// GET /api/pages?all=1      -> lista todas (requiere usuario)
export async function GET(req: NextRequest) {
  const supabase = supa();
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";

  if (all) {
    // solo para usuarios logueados (autor verá las suyas por RLS)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
    const { data, error } = await supabase.from("pages").select("*").order("updated_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
  }

  const { data, error } = await supabase
    .from("pages")
    .select("slug,title,updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

// POST /api/pages  {slug,title,body,published?}
export async function POST(req: NextRequest) {
  const supabase = supa();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const { slug, title, body, published = true } = await req.json();
  if (!slug || !title || !body) return NextResponse.json({ error: "Campos incompletos" }, { status: 400 });

  const { error } = await supabase.from("pages")
    .insert({ slug, title, body, published, author_id: user.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
