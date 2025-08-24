// src/app/foro/page.tsx
import Link from "next/link";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function ForoPage() {
  const supa = createSupabaseServerClientReadOnly();
  const { data: { user } } = await supa.auth.getUser();

  const [sRes, tRes] = await Promise.all([
    fetch("/api/sections", { cache: "no-store" }),
    fetch("/api/threads",  { cache: "no-store" }),
  ]);

  const { sections } = sRes.ok ? await sRes.json() : { sections: [] as any[] };
  const { threads }  = tRes.ok ? await tRes.json() : { threads:  [] as any[] };

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Foros actuales</h1>
        {user
          ? <Link href="/new-thread" className="px-3 py-2 rounded-md bg-primary text-primary-foreground">Nuevo foro</Link>
          : <Link href="/login" className="underline">Inicia sesión para publicar</Link>
        }
      </div>

      <div className="flex gap-2 flex-wrap">
        {sections?.map((s: any) => (
          <Link key={s.slug} className="border rounded px-3 py-1" href={`/foro/section/${s.slug}`}>
            {s.title}
          </Link>
        ))}
      </div>

      <ul className="space-y-3">
        {threads?.map((t: any) => (
          <li key={t.id} className="border rounded p-3">
            <div className="text-sm opacity-70">{t.sections?.title}</div>
            <Link href={`/threads/${t.id}`} className="font-medium hover:underline">{t.title}</Link>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {new Date(t.created_at).toLocaleString()}
            </div>
          </li>
        ))}
        {!threads?.length && <p className="opacity-70">Aún no hay hilos.</p>}
      </ul>
    </main>
  );
}
