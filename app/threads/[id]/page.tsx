// app/threads/[id]/page.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supaMeta() {
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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = supaMeta();
  const { data: t } = await supabase.from("threads")
    .select("title").eq("id", params.id).maybeSingle();

  const title = t?.title ? `${t.title} · Foro · Hablando de Caballos` : "Foro · Hablando de Caballos";
  return { title, openGraph: { title } };
}

import Link from "next/link";
import ReplyEditor from "./ReplyEditor";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function createSupabaseServer() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }); } catch {} },
      remove(name: string, options: any) { try { cookieStore.set({ name, value: "", ...options }); } catch {} }
    }
  });
}

type PageProps = { params: { id: string } };

export default async function ThreadPage({ params }: PageProps) {
  const supabase = createSupabaseServer();

  const { data: thread, error: threadErr } = await supabase
    .from("threads")
    .select("id, title, created_at")
    .eq("id", params.id)
    .single();

  if (threadErr || !thread) {
    return (
      <main className="mx-auto max-w-4xl p-4">
        <p className="mb-3">Hilo no encontrado.</p>
        <Link href="/" className="text-blue-600 underline">Volver</Link>
      </main>
    );
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, body, author_id, created_at")
    .eq("thread_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-4xl p-4 space-y-6">
      <header className="border-b pb-3">
        <h1 className="text-2xl font-semibold">{thread.title}</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Creado el {new Date(thread.created_at).toLocaleString()}
        </p>
      </header>

      <section className="space-y-4">
        {(posts ?? []).map((p) => (
          <article key={p.id} className="rounded border p-3">
            <div className="mb-1 text-xs text-neutral-500">
              Autor: {p.author_id} · {new Date(p.created_at).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">{p.body}</div>
          </article>
        ))}
        {(!posts || posts.length === 0) && (
          <div className="rounded border border-dashed p-6 text-center text-neutral-500">
            Aún no hay respuestas. ¡Sé el primero en comentar!
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-medium">Responder</h2>
        <ReplyEditor threadId={thread.id} />
      </section>
    </main>
  );
}
