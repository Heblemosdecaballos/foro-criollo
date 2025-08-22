// app/api/pages/[slug]/route.ts
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

// GET público (si published=true por RLS)
export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = supa();
  const { data, error } = await supabase
    .from("pages")
    .select("slug,title,body,updated_at,published")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(data);
}

// PUT requiere ser autor por RLS
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = supa();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const { title, body, published } = await req.json();
  const { error } = await supabase.from("pages")
    .update({ title, body, published })
    .eq("slug", params.slug);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE requiere ser autor por RLS
export async function DELETE(_: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = supa();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const { error } = await supabase.from("pages").delete().eq("slug", params.slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
