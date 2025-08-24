// src/app/foro/page.tsx
import Link from "next/link";
import { categories } from "@/constants/forums";

export const dynamic = "force-dynamic";

export default async function ForoPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/threads`, { cache: "no-store" }).catch(() => null);
  const threads = res?.ok ? (await res!.json()).threads ?? [] : [];

  return (
    <main className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Foros</h1>
        <Link href="/foro/nuevo" className="px-3 py-2 rounded bg-[var(--brand-green)] text-white">
          Crear foro
        </Link>
      </div>

      {/* Filtro rápido por categorías */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link key={c} href={`/foro?cat=${encodeURIComponent(c)}`}
                className="px-2 py-1 rounded border hover:bg-white/40">
            {c}
          </Link>
        ))}
      </div>

      <ul className="space-y-3">
        {threads.map((t:any)=>(
          <li key={t.id} className="border rounded p-3 bg-white/60">
            <Link href={`/threads/${t.id}`} className="font-medium hover:underline">
              {t.title}
            </Link>
            {t.category && <div className="text-xs opacity-70 mt-1">{t.category}</div>}
          </li>
        ))}
        {!threads.length && <p className="opacity-70">Aún no hay foros.</p>}
      </ul>
    </main>
  );
}
