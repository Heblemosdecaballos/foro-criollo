import NewsForm from "@/components/NewsForm";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const supa = createSupabaseServerClientReadOnly();
  const { data: { user } } = await supa.auth.getUser();

  let posts: any[] = [];
  try {
    const r = await fetch("/api/noticias", { cache: "no-store" });
    if (r.ok) posts = (await r.json()).posts ?? [];
  } catch {}

  return (
    <main className="container py-6 space-y-6">
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
            <div className="text-xs muted-date mt-1">{new Date(p.created_at).toLocaleString()}</div>
          </li>
        ))}
        {!posts.length && <p className="opacity-70">Aún no hay noticias.</p>}
      </ul>
    </main>
  );
}
