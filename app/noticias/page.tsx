// app/noticias/page.tsx
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

export default async function NewsList() {
  const db = supa();
  const { data } = await db
    .from("news")
    .select("slug,title,excerpt,cover_url,created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Noticias</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {(data ?? []).map(n => (
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
              <p className="mt-1 text-xs text-neutral-500">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          </Link>
        ))}
        {(data?.length ?? 0) === 0 && (
          <div className="rounded border border-dashed p-4 text-center text-neutral-500">Sin noticias aún</div>
        )}
      </div>
    </main>
  );
}
