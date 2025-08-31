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
    const token = req.headers.get("x-setup-token") ?? "";
    if (!process.env.SETUP_ADMIN_TOKEN || token !== process.env.SETUP_ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!url || !serviceKey) {
      return NextResponse.json({ ok: false, error: "Missing Supabase env" }, { status: 500 });
    }

    const supabaseAdmin = createClient(url, serviceKey);

    const body = await req.json().catch(() => ({}));
    const emailFinal = (body.email || process.env.HALL_ADMIN_EMAIL || "")
      .toString()
      .trim()
      .toLowerCase();
    const passwordFinal = (body.password || "").toString();

    if (!emailFinal || !passwordFinal) {
      return NextResponse.json(
        { ok: false, error: "email y password requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: emailFinal,
      password: passwordFinal,
      email_confirm: true, // confirmado sin SMTP
      user_metadata: { role: "admin" },
    });

    if (error) {
      // DIAGNÓSTICO: devolvemos más detalles para ver el motivo real
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          code: (error as any)?.code ?? null,
          name: (error as any)?.name ?? null,
          details: (error as any)?.error_description ?? null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: true, user_id: data.user?.id ?? null },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Error" },
      { status: 500 }
    );
  }
}
