// app/page.tsx
import Link from "next/link";
import AdSlot from "../components/ads/AdSlot";
import Section from "../components/Section";
import Card from "../components/ui/Card";
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

export default async function Home() {
  const db = supa();
  const [{ data: news }, { data: threads }, { data: stories }] = await Promise.all([
    db.from("news").select("slug,title,excerpt,cover_url,created_at").eq("published",true).order("created_at",{ascending:false}).limit(3),
    db.from("threads").select("id,title,created_at").order("created_at",{ascending:false}).limit(5),
    db.from("stories").select("id,title,created_at,story_media(url,kind)").eq("status","published").order("created_at",{ascending:false}).limit(6)
  ]);

  return (
    <main className="space-y-8">
      {/* ===== HERO ===== */}
      <section className="section">
        <Card className="overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold sm:text-3xl">Hablando de Caballos</h1>
            <p className="mt-2 max-w-2xl text-white/90">
              Comunidad, foro, historias y noticias del Caballo Criollo Colombiano.
            </p>
            <div className="mt-4">
              <Link href="/historias/nueva" className="rounded-md bg-white px-3 py-1.5 text-emerald-700 hover:bg-emerald-50">
                Publicar una historia
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* ===== CONTENIDO + SIDEBAR ===== */}
      <div className="section">
        <div className="grid grid-cols-12 gap-6">
          {/* Columna principal */}
          <div className="col-span-12 space-y-8 lg:col-span-8">
            {/* Noticias */}
            <Section
              title="Noticias"
              action={<Link href="/noticias" className="text-sm text-blue-600 hover:underline">Ver todas</Link>}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {(news ?? []).map(n => (
                  <Link key={n.slug} href={`/noticias/${n.slug}`} className="card card-hover overflow-hidden">
                    <div className="aspect-video w-full bg-neutral-100">
                      {n.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.cover_url} alt={n.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-1 font-medium">{n.title}</h3>
                      {n.excerpt && <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{n.excerpt}</p>}
                    </div>
                  </Link>
                ))}
                {(news?.length ?? 0) === 0 && <div className="rounded border border-dashed p-4 text-center text-neutral-500">Sin noticias aún</div>}
              </div>
            </Section>

            {/* Foro */}
            <Section
              title="Últimos hilos del foro"
              action={<Link href="/threads" className="text-sm text-blue-600 hover:underline">Ver todos</Link>}
            >
              <div className="space-y-2">
                {(threads ?? []).map((t: any) => (
                  <Link key={t.id} href={`/threads/${t.id}`} className="block rounded-xl border p-3 hover:bg-neutral-50">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-neutral-500">{new Date(t.created_at).toLocaleString()}</div>
                  </Link>
                ))}
              </div>
            </Section>

            {/* Historias */}
            <Section
              title="Historias recientes"
              action={<Link href="/historias" className="text-sm text-blue-600 hover:underline">Ver todas</Link>}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {(stories ?? []).map((s: any) => (
                  <Link key={s.id} href={`/historias/${s.id}`} className="card card-hover overflow-hidden">
                    <div className="aspect-video w-full bg-neutral-100">
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
            </Section>
          </div>

          {/* Sidebar de banners */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="sticky top-[72px] space-y-6">
              <AdSlot slot="hero" className="block w-full overflow-hidden rounded-2xl" />
              <AdSlot slot="sidebar" className="block w-full overflow-hidden rounded-2xl" />
              <AdSlot slot="sidebar-2" className="block w-full overflow-hidden rounded-2xl" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
