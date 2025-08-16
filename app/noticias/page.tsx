// app/noticias/page.tsx
import Link from "next/link";
import Card from "../../components/ui/Card";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supa() {
  const c = cookies(); const u = process.env.NEXT_PUBLIC_SUPABASE_URL!; const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(u, k, { cookies:{ get:n=>c.get(n)?.value, set:(n,v,o)=>{try{c.set({name:n,value:v,...o})}catch{}}, remove:(n,o)=>{try{c.set({name:n,value:"",...o})}catch{}} }});
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
    <main className="page space-y-4">
      <h1 className="text-2xl font-semibold">Noticias</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {(data ?? []).map(n => (
          <Link key={n.slug} href={`/noticias/${n.slug}`}>
            <Card className="card-hover overflow-hidden">
              <div className="aspect-video w-full bg-neutral-100">
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
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
