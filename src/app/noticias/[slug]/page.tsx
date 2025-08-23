// app/noticias/[slug]/page.tsx
import type { Metadata } from "next";
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const db = supa();
  const { data: n } = await db.from("news").select("title,excerpt,cover_url").eq("slug", params.slug).maybeSingle();
  const title = n?.title ? `${n.title} · Noticias · Hablando de Caballos` : "Noticias · Hablando de Caballos";
  const description = n?.excerpt ?? undefined;
  return {
    title, description,
    openGraph: { title, description, images: n?.cover_url ? [{ url: n.cover_url }] : undefined }
  };
}

export default async function NewsDetail({ params }: { params: { slug: string } }) {
  const db = supa();
  const { data: n } = await db.from("news").select("*").eq("slug", params.slug).maybeSingle();
  if (!n) return <main className="mx-auto max-w-3xl p-4">No encontrada.</main>;

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{n.title}</h1>
        {n.excerpt && <p className="text-neutral-700">{n.excerpt}</p>}
        <p className="text-xs text-neutral-500">{new Date(n.created_at).toLocaleString()}</p>
      </header>

      {n.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={n.cover_url} alt={n.title} className="w-full rounded-lg" />
      )}

      <article className="prose max-w-none whitespace-pre-wrap">{n.body}</article>
    </main>
  );
}
