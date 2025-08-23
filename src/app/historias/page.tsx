import StoryForm from "@/components/StoryForm";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function HistoriasPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  const supa = createSupabaseServerClientReadOnly();
  const { data: { user } } = await supa.auth.getUser();

  const res = await fetch(`${base}/api/historias`, { cache: "no-store" });
  const { posts } = res.ok ? await res.json() : { posts: [] as any[] };

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Historias</h1>
        {!user && <a href="/login" className="underline">Inicia sesión para publicar</a>}
      </div>

      {user && <StoryForm />}

      <ul className="space-y-3">
        {posts.map((p: any) => (
          <li key={p.id} className="border rounded p-3">
            <h3 className="font-medium">{p.title}</h3>
            {p.media_path?.match(/^https?:\/\//i)
              ? <video src={p.media_path} controls className="w-full h-auto rounded mt-2" />
              : p.media_path
                ? <img src={p.media_path} alt="" className="w-full h-auto rounded mt-2" />
                : null}
            {p.content && <p className="mt-2 opacity-80 whitespace-pre-wrap">{p.content}</p>}
            <div className="text-xs opacity-60 mt-1">{new Date(p.created_at).toLocaleString()}</div>
          </li>
        ))}
        {!posts.length && <p className="opacity-70">Aún no hay historias.</p>}
      </ul>
    </main>
  );
}
