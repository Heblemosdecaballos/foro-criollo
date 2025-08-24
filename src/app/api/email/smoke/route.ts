// src/app/api/email/smoke/route.ts
import { NextResponse } from "next/server";

/**
 * Test rápido para verificar que Resend está enviando correos.
 * GET /api/email/smoke?key=<CRON_SECRET>&to=alguien@correo.com
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  const to = url.searchParams.get("to") || "";

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM || "no-reply@notifs.hablandodecaballos.com";

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY missing" },
      { status: 500 }
    );
  }
  if (!to) {
    return NextResponse.json(
      { ok: false, error: "query param 'to' is required" },
      { status: 400 }
    );
  }
  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "invalid key" },
      { status: 401 }
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "HDC • SMTP smoke test",
      html: `<p>Si ves este correo, Resend está funcionando ✅</p>`,
    }),
  });

  const json = await res.json().catch(() => ({}));
  return NextResponse.json({ ok: res.ok, status: res.status, json });
}
