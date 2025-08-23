// app/sitemap.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supa() {
  const c = cookies();
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(u, k, {
    cookies: {
      get: n => c.get(n)?.value,
      set: (n, v, o) => { try { c.set({ name: n, value: v, ...o }); } catch {} },
      remove: (n, o) => { try { c.set({ name: n, value: "", ...o }); } catch {} }
    }
  });
}

export default async function sitemap() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const db = supa();
  const [{ data: threads }, { data: stories }, { data: pages }, { data: news }] = await Promise.all([
    db.from("threads").select("id,created_at").order("created_at",{ascending:false}).limit(50),
    db.from("stories").select("id,created_at").eq("status","published").order("created_at",{ascending:false}).limit(50),
    db.from("pages").select("slug,updated_at").eq("published",true).order("updated_at",{ascending:false}).limit(50),
    db.from("news").select("slug,updated_at").eq("published",true).order("updated_at",{ascending:false}).limit(50),
  ]);

  const staticEntries = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/noticias`, lastModified: new Date() },
    { url: `${base}/historias`, lastModified: new Date() },
    { url: `${base}/threads`, lastModified: new Date() },
  ];

  const threadEntries = (threads ?? []).map(t => ({ url: `${base}/threads/${t.id}`,   lastModified: t.created_at }));
  const storyEntries  = (stories ?? []).map(s => ({ url: `${base}/historias/${s.id}`,  lastModified: s.created_at }));
  const pageEntries   = (pages ?? []).map(p => ({ url: `${base}/p/${p.slug}`,          lastModified: p.updated_at }));
  const newsEntries   = (news ?? []).map(n => ({ url: `${base}/noticias/${n.slug}`,    lastModified: n.updated_at }));

  return [...staticEntries, ...threadEntries, ...storyEntries, ...pageEntries, ...newsEntries];
}
