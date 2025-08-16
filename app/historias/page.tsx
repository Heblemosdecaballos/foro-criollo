// app/historias/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supa() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get(n: string) { return cookieStore.get(n)?.value; },
      set(n: string, v: string, o: any) { try { cookieStore.set({ name: n, value: v, ...o }); } catch {} },
      remove(n: string, o: any) { try { cookieStore.set({ name: n, value: "", ...o }); } catch {} }
    }
  });
}

export default async function HistoriasPage() {
  const supabase = supa();
  const { data: stories } = await supabase
    .from("stories")
    .select("id,title,created_at,like_count,comment_count,story_media(url,kind)")
    .eq("status","published")
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <main className="mx-auto max-w-6xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Historias</h1>
        <Link href="/historias/nueva" className="rounded bg-blue-600 px-3 py-2 text-white">+ Nueva historia</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {(stories ?? []).map((s: any) => (
          <Link key={s.id} href={`/historias/${s.id}`} className="rounded-lg border hover:shadow">
            <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-neutral-100">
              {s.story_media?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.story_media[0].url} alt={s.title ?? "Historia"} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-3">
              <h3 className="line-clamp-1 font-medium">{s.title ?? "Sin título"}</h3>
              <p className="mt-1 text-sm text-neutral-600">❤️ {s.like_count} · 💬 {s.comment_count}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
