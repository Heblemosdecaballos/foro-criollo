// app/historias/page.tsx
import Link from "next/link";
import Card from "../../components/ui/Card";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supa() {
  const c = cookies(); const u = process.env.NEXT_PUBLIC_SUPABASE_URL!; const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(u, k, { cookies:{ get:n=>c.get(n)?.value, set:(n,v,o)=>{try{c.set({name:n,value:v,...o})}catch{}}, remove:(n,o)=>{try{c.set({name:n,value:"",...o})}catch{}} }});
}

export default async function HistoriasPage() {
  const db = supa();
  const { data: stories } = await db
    .from("stories")
    .select("id,title,created_at,story_media(url,kind)")
    .eq("status","published")
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <main className="page space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Historias</h1>
        <Link href="/historias/nueva" className="btn-primary">+ Nueva historia</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {(stories ?? []).map((s: any) => (
          <Link key={s.id} href={`/historias/${s.id}`}>
            <Card className="card-hover overflow-hidden">
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
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
