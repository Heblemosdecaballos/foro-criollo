// app/api/ads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supa() {
  const c = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get: (n) => c.get(n)?.value,
      set: (n, v, o) => { try { c.set({ name: n, value: v, ...o }); } catch {} },
      remove: (n, o) => { try { c.set({ name: n, value: "", ...o }); } catch {} },
    },
  });
}

// POST -> crear anuncio
// Body: { slot, image_url?, link_url?, html?, active? }
export async function POST(req: NextRequest) {
  const db = supa();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const payload = await req.json();
  const slot = String(payload.slot || "").trim();
  const image_url = payload.image_url?.trim() || null;
  const link_url = payload.link_url?.trim() || null;
  const html = payload.html?.trim() || null;
  const active = payload.active === false ? false : true;

  if (!slot) return NextResponse.json({ error: "Falta slot" }, { status: 400 });
  if (!html && !(image_url && link_url)) {
    return NextResponse.json(
      { error: "Debes enviar HTML o bien Imagen + Link" },
      { status: 400 }
    );
  }

  const { error } = await db.from("ads").insert({
    slot, image_url, link_url, html, active, author_id: user.id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// GET -> lista anuncios (público: solo activos). ?all=1 requiere login
export async function GET(req: NextRequest) {
  const db = supa();
  const all = new URL(req.url).searchParams.get("all") === "1";

  if (all) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
    const { data, error } = await db.from("ads").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
  }

  const { data, error } = await db
    .from("ads")
    .select("slot,image_url,link_url,html,created_at")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
