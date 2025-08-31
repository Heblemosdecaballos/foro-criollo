// src/app/api/setup/create-admin/route.ts
// Ruta TEMPORAL para crear el primer usuario admin.
// Requiere header: x-setup-token = process.env.SETUP_ADMIN_TOKEN
// Bórrala después de usarla.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-setup-token") || "";
    if (!process.env.SETUP_ADMIN_TOKEN || token !== process.env.SETUP_ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: "Missing Supabase env" }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = await req.json().catch(() => ({}));
    const email = (body.email || process.env.HALL_ADMIN_EMAIL || "").toString().trim().toLowerCase();
    const password = (body.password || "").toString();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "email y password requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { role: "admin" },
});

if (error) {
  // TEMPORAL: devolver error crudo para diagnosticar
  return NextResponse.json(
    { ok: false, error: error.message, name: (error as any).name, details: (error as any).error_description || null },
    { status: 400 }
  );
}
