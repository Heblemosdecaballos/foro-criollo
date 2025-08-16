// app/page.tsx
import AdSlot from "../components/ads/AdSlot";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supa() {
  const c = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get: n => c.get(n)?.value,
      set: (n, v, o) => { try { c.set({ name: n, value: v, ...o }); } catch {} },
      remove: (n, o) => { try { c.set({ name: n, value: "", ...o }); } catch {} }
    }
  });
}

export default async function Home() {
  const db = supa();
  const [{ data: news }, { data: threads }, { data: stories }] = await Promise.all([
    db.from("news").select("slug,title,excerpt,cover_url,created_at").eq("published",true).order("created_at",{ascending:false}).limit(3),
    db.from("threads").select("id,title,created_at").order("created_at",{ascending:false}).limit(5),
    db.from("stories").select("id,title,created_at,story_media(url,kind)").eq("status","published").order("created_at",{ascending:false}).limit(6)
  ]);

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-8">
      <section className="rounded-xl border bg-white p-4">
        <AdSlot slot="hero" className="block w-full rounded-xl overflow-hidden" />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Noticias</h2>
          <Link href="/noticias" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(news ?? []).map(n => (
            <Link key={n.slug} href={`/noticias/${n.slug}`} className="rounded-lg border hover:shadow">
              <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-neutral-100">
                {n.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.cover_url} className="h-full w-full object-cover" alt={n.title} />
                )}
              </div>
              <div className="p-3">
                <h3 className="line-clamp-1 font-medium">{n.title}</h3>
                {n.excerpt && <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{n.excerpt}</p>}
              </div>
            </Link>
          ))}
          {(news?.length ?? 0) === 0 && (
            <div className="rounded border border-dashed p-4 text-center text-neutral-500">Sin noticias aún</div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Últimos hilos del foro</h2>
          <Link href="/threads" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
        </div>
        <div className="space-y-2">
          {(threads ?? []).map((t: any) => (
            <Link key={t.id} href={`/threads/${t.id}`} className="block rounded-lg border p-3 hover:bg-neutral-50">
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-neutral-500">{new Date(t.created_at).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Historias recientes</h2>
          <Link href="/historias" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {(stories ?? []).map((s: any) => (
            <Link key={s.id} href={`/historias/${s.id}`} className="rounded-lg border hover:shadow">
              <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-neutral-100">
                {s.story_media?.[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.story_media[0].url} alt={s.title ?? "Historia"} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <h3 className="line-clamp-1 font-medium">{s.title ?? "Sin título"}</h3>
                <p className="mt-1 text-xs text-neutral-500">{new Date(s.created_at).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

