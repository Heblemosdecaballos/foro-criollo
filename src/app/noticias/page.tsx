import NewsForm from "@/components/NewsForm";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  const supa = createSupabaseServerClientReadOnly();
  const { data: { user } } = await supa.auth.getUser();

  const res = await fetch(`${base}/api/noticias`, { cache: "no-store" });
  const { posts } = res.ok ? await res.json() : { posts: [] as any[] };

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Noticias</h1>
        {!user && <a href="/login" className="underline">Inicia sesión para publicar</a>}
      </div>

      {user && <NewsForm />}

      <ul className="space-y-3">
        {posts.map((p: any) => (
          <li key={p.id} className="border rounded p-3">
            <h3 className="font-medium">{p.title}</h3>
            {p.cover_path && <img src={p.cover_path} alt="" className="w-full h-auto rounded mt-2" />}
            {p.content && <p className="mt-2 opacity-80 whitespace-pre-wrap">{p.content}</p>}
            <div className="text-xs opacity-60 mt-1">{new Date(p.created_at).toLocaleString()}</div>
          </li>
        ))}
        {!posts.length && <p className="opacity-70">Aún no hay noticias.</p>}
      </ul>
    </main>
  );
}
