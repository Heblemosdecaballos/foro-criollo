import type { MetadataRoute } from 'next';
import { getSupabaseServerAnon } from '../lib/supabaseServerAnon';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://foro-criollo.vercel.app';

  const supabase = getSupabaseServerAnon();

  const { data: threads } = await supabase
    .from('v_threads_compact')
    .select('id, created_at, last_post_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/threads`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];

  const threadRoutes: MetadataRoute.Sitemap = (threads ?? []).map((t) => ({
    url: `${baseUrl}/threads/${t.id}`,
    lastModified: t.last_post_at ?? t.created_at ?? now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticRoutes, ...threadRoutes];
}
