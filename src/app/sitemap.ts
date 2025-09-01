import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

// ⚠️ este archivo corre en build/runtime del servidor
// usa la anon key, suficiente para leer hilos públicos (RLS).
let supabase: ReturnType<typeof createClient> | null = null;

// Solo crear cliente si las variables están configuradas
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  } catch (error) {
    console.warn('Supabase not configured for sitemap generation');
    supabase = null;
  }
}

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

  // Hilos (solo si Supabase está configurado)
  if (supabase) {
    try {
      const { data: threads } = await supabase
        .from("threads")
        .select("slug, updated_at, created_at, is_deleted")
        .eq("is_deleted", false)
        .order("updated_at", { ascending: false })
        .limit(2000);

      // Type assertion for threads
      type ThreadType = {
        slug: string;
        updated_at?: string;
        created_at?: string;
        is_deleted: boolean;
      };

      for (const t of (threads as ThreadType[]) ?? []) {
        const last = t.updated_at ?? t.created_at ?? new Date().toISOString();
        urls.push({
          url: `${siteUrl}/foros/${t.slug}`,
          lastModified: new Date(last),
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    } catch (error) {
      console.warn('Error fetching threads for sitemap:', error);
    }
  }

  return urls;
}
