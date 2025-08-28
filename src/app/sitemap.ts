import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

// ⚠️ este archivo corre en build/runtime del servidor
// usa la anon key, suficiente para leer hilos públicos (RLS).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://hablandodecaballos.com";

  // Ruta raíz
  const urls: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/foros`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Hilos (solo no borrados)
  const { data: threads } = await supabase
    .from("threads")
    .select("slug, updated_at, created_at, is_deleted")
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false })
    .limit(2000);

  for (const t of threads ?? []) {
    const last = t.updated_at ?? t.created_at ?? new Date().toISOString();
    urls.push({
      url: `${siteUrl}/foros/${t.slug}`,
      lastModified: new Date(last),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  return urls;
}
