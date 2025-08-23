// app/api/stories/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supa() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get(n: string) { return cookieStore.get(n)?.value; },
      set(n: string, v: string, o: any) { try { cookieStore.set({ name: n, value: v, ...o }); } catch {} },
      remove(n: string, o: any) { try { cookieStore.set({ name: n, value: "", ...o }); } catch {} }
    }
  });
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supa();
  const { data, error } = await supabase
    .from("story_comments")
    .select("id,body,author_id,parent_id,created_at")
    .eq("story_id", params.id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supa();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const { body, parent_id } = await req.json();
  if (!body || !body.trim()) return NextResponse.json({ error: "El comentario no puede ir vacío" }, { status: 400 });

  const { error } = await supabase.from("story_comments")
    .insert({ story_id: params.id, author_id: user.id, body, parent_id: parent_id ?? null });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
