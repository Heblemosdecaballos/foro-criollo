// app/api/threads/[id]/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function createSupabaseServer() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }); } catch {} },
      remove(name: string, options: any) { try { cookieStore.set({ name, value: "", ...options }); } catch {} }
    }
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const { body } = await req.json();
  if (!body || !body.trim()) return NextResponse.json({ error: "El cuerpo no puede estar vacío" }, { status: 400 });

  const { error } = await supabase.from("posts").insert({
    thread_id: params.id,
    author_id: user.id,
    body
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
