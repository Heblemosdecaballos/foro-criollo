// src/app/foro/page.tsx
import Link from "next/link";
import { categories } from "@/constants/forums";

export const dynamic = "force-dynamic";

export default async function ForoPage({
  searchParams,
}: { searchParams?: { cat?: string } }) {
  const cat = searchParams?.cat ?? "";
  let threads: any[] = [];
  let errorMsg = "";

  try {
    const qs = cat ? `?cat=${encodeURIComponent(cat)}` : "";
    const res = await fetch(`/api/threads${qs}`, { cache: "no-store" });
    const j = await res.json();
    if (!res.ok || !j.ok) throw new Error(j.error || "No se pudo cargar");
    threads = j.threads || [];
  } catch (e: any) {
    errorMsg = "No se pudo cargar el foro.";
  }

  return (
    <main className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Foros</h1>
        <Link href="/foro/nuevo" className="px-3 py-2 rounded bg-[var(--brand-green)] text-white">
          Crear foro
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/foro" className={`px-2 py-1 rounded border ${!cat ? "bg-white/60" : ""}`}>Todas</Link>
        {categories.map((c) => (
          <Link key={c} href={`/foro?cat=${encodeURIComponent(c)}`}
                className={`px-2 py-1 rounded border ${cat===c ? "bg-white/60" : ""}`}>
            {c}
          </Link>
        ))}
      </div>

      {errorMsg ? (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Ocurrió un error cargando el foro</h2>
          <Link href="/foro" className="underline">Reintentar</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {threads.map((t) => (
            <li key={t.id} className="border rounded p-3 bg-white/60">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{t.title}</h3>
                {t.category && <span className="text-xs opacity-70">{t.category}</span>}
              </div>
              {t.content && <p className="opacity-80 mt-1 line-clamp-3">{t.content}</p>}
            </li>
          ))}
          {!threads.length && <p className="opacity-70">Aún no hay foros.</p>}
        </ul>
      )}
    </main>
  );
}
