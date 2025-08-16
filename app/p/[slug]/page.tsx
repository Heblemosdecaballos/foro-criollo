// app/p/[slug]/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Metadata } from "next";

function supa() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get: (n) => cookieStore.get(n)?.value,
      set: (n, v, o) => { try { cookieStore.set({ name: n, value: v, ...o }); } catch {} },
      remove: (n, o) => { try { cookieStore.set({ name: n, value: "", ...o }); } catch {} }
    }
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = supa();
  const { data: p } = await supabase.from("pages")
    .select("title,body").eq("slug", params.slug).maybeSingle();
  return {
    title: p?.title ?? "Página",
    description: p?.body ? p.body.slice(0, 150) : undefined,
    openGraph: { title: p?.title ?? "Página", description: p?.body?.slice(0, 200) }
  };
}

export default async function PageView({ params }: { params: { slug: string } }) {
  const supabase = supa();
  const { data: p } = await supabase.from("pages")
    .select("title,body,updated_at").eq("slug", params.slug).maybeSingle();

  if (!p) return <main className="mx-auto max-w-3xl p-4">No encontrada.</main>;

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-2xl font-semibold">{p.title}</h1>
      <article className="prose max-w-none whitespace-pre-wrap">
        {p.body}
      </article>
      <p className="text-xs text-neutral-500">Actualizada: {new Date(p.updated_at).toLocaleString()}</p>
    </main>
  );
}
