import Link from "next/link";
import { createSupabaseServerClientReadOnly } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function ForoPage() {
  const supa = createSupabaseServerClientReadOnly();
  const { data: { user } } = await supa.auth.getUser();

  const [sections, threads] = await Promise.all([
    (async () => {
      try {
        const r = await fetch("/api/sections", { cache: "no-store" });
        if (!r.ok) return [];
        const j = await r.json();
        return j.sections ?? [];
      } catch { return []; }
    })(),
    (async () => {
      try {
        const r = await fetch("/api/threads", { cache: "no-store" });
        if (!r.ok) return [];
        const j = await r.json();
        return j.threads ?? [];
      } catch { return []; }
    })(),
  ]);

  return (
    <main className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Foros actuales</h1>
        {user
          ? <Link href="/new-thread" className="px-3 py-2 rounded-md bg-primary text-primary-foreground">Nuevo foro</Link>
          : <Link href="/login" className="underline">Inicia sesión para publicar</Link>
        }
      </div>

      <div className="flex gap-2 flex-wrap">
        {sections.map((s: any) => (
          <Link key={s.slug} className="border rounded px-3 py-1" href={`/foro/section/${s.slug}`}>
            {s.title}
          </Link>
        ))}
        {!sections.length && <p className="opacity-70">Sin secciones.</p>}
      </div>

      <ul className="space-y-3">
        {threads.map((t: any) => (
          <li key={t.id} className="border rounded p-3">
            <Link href={`/threads/${t.id}`} className="font-medium hover:underline">{t.title}</Link>
            <div className="text-xs muted-date mt-1">{new Date(t.created_at).toLocaleString()}</div>
          </li>
        ))}
        {!threads.length && <p className="opacity-70">Aún no hay hilos.</p>}
      </ul>
    </main>
  );
}
