/* OG Image dinámico del hilo */
import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Hablando de Caballos — Foro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function OpengraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: thread } = await supabase
    .from("threads")
    .select("title, is_deleted")
    .eq("slug", params.slug)
    .single();

  const title =
    !thread || thread.is_deleted ? "Hilo no disponible" : thread.title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)",
          padding: 48,
          color: "white",
          fontSize: 48,
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            opacity: 0.9,
            marginBottom: 12,
            letterSpacing: 1,
          }}
        >
          Hablando de Caballos · Foros
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            textShadow: "0 6px 18px rgba(0,0,0,.25)",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 24, opacity: 0.9 }}>
          hablandodecaballos.com
        </div>
      </div>
    ),
    { ...size }
  );
}
