// src/app/foro/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/utils/supabase/server";

type Thread = {
  id: string;
  title: string;
  category: string;
  tags: string[] | null;
  author_id: string | null;
  created_at: string;
  replies_count: number;
  views: number;
  hot: boolean;
  open_today: boolean;
  last_activity: string | null;
  status: "open" | "closed";
  created_by: string | null;
  pinned_post_id: string | null;
};

type ThreadsApiResponse =
  | { ok: true; threads: Thread[] }
  | { ok: false; error?: string };

export const dynamic = "force-dynamic";

function getBaseUrl() {
  // Prioridades: NEXT_PUBLIC_SITE_URL > VERCEL_URL > localhost
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

async function fetchFromApi(cat?: string) {
  const qs = cat ? `?cat=${encodeURIComponent(cat)}` : "";
  const base = getBaseUrl();
  const url = `${base}/api/threads${qs}`;

  const debug: Record<string, any> = { base, url, phase: "api" };

  try {
    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
      headers: { "cache-control": "no-store" },
    });
    debug.status = res.status;

    let json: ThreadsApiResponse | null = null;
    try {
      json = (await res.json()) as ThreadsApiResponse;
    } catch (e) {
      debug.jsonParseError = (e as Error).message;
      return { threads: [] as Thread[], errorMsg: "Respuesta no interpretable.", debug };
    }

    debug.json = json;

    if (!res.ok || !json || json.ok !== true) {
      return {
        threads: [] as Thread[],
        errorMsg:
          (json && "error" in json && json.error) ||
          `API respondió ${res.status}`,
        debug,
      };
    }

    return { threads: json.threads || [], debug };
  } catch (e) {
    debug.throw = (e as Error).message;
    return { threads: [] as Thread[], errorMsg: "Fallo al llamar la API.", debug };
  }
}

async function fetchFromSupabase(cat?: string) {
  const debug: Record<string, any> = { phase: "supabase" };
  try {
    const supa = createSupabaseServerClient();
    let q = supa
      .from("threads")
      .select(
        "id,title,category,tags,author_id,created_at,replies_count,views,hot,open_today,last_activity,status,created_by,pinned_post_id"
      )
      .order("last_activity", { ascending: false });

    if (cat) q = q.eq("category", cat);

    const { data, error } = await q;
    debug.error = error || null;

    if (error) {
      return { threads: [] as Thread[], errorMsg: "No se pudo leer desde Supabase.", debug };
    }
    return { threads: (data as Thread[]) || [], debug };
  } catch (e) {
    debug.throw = (e as Error).message;
    return { threads: [] as Thread[], errorMsg: "Excepción al leer Supabase.", debug };
  }
}

export default async function ForoPage({
  searchParams,
}: {
  searchParams: { cat?: string; debug?: string };
}) {
  const cat = searchParams?.cat;

  // 1) Intento API
  const apiRes = await fetchFromApi(cat);

  // 2) Si la API falla / viene vacía, fallback a Supabase directo
  const mustFallback = !!apiRes.errorMsg;
  const supaRes = mustFallback ? await fetchFromSupabase(cat) : null;

  const threads = mustFallback ? supaRes!.threads : apiRes.threads;
  const errorMsg = mustFallback ? supaRes!.errorMsg : undefined;

  const showDebug = searchParams?.debug === "1";
  const debug = showDebug
    ? {
        api: apiRes,
        fallbackUsed: mustFallback,
        supabase: supaRes,
        env: {
          NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "(undefined)",
          VERCEL_URL: process.env.VERCEL_URL || "(undefined)",
        },
      }
    : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Foro</h1>
        <Link
          href="/foro/nuevo"
          className="rounded-md border border-black/20 px-3 py-2 text-sm hover:bg-black/5"
        >
          + Nuevo foro
        </Link>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2 text-sm">
        <Link
          href="/foro"
          className={`rounded-md px-2 py-1 ${!cat ? "bg-black text-white" : "bg-black/5"}`}
        >
          Todos
        </Link>
        <Link
          href="/foro?cat=Aprendizaje"
          className={`rounded-md px-2 py-1 ${cat === "Aprendizaje" ? "bg-black text-white" : "bg-black/5"}`}
        >
          Aprendizaje
        </Link>
        <Link
          href="/foro?cat=Historia"
          className={`rounded-md px-2 py-1 ${cat === "Historia" ? "bg-black text-white" : "bg-black/5"}`}
        >
          Historia
        </Link>
      </nav>

      {errorMsg ? (
        <section className="rounded-lg bg-black/5 p-6">
          <h2 className="mb-2 text-xl font-semibold">Ocurrió un error cargando el foro</h2>
          <p className="mb-3 text-sm opacity-80">{errorMsg}</p>
          {debug && (
            <pre className="mb-3 overflow-auto rounded bg-white p-3 text-xs">
              {JSON.stringify(debug, null, 2)}
            </pre>
          )}
          <div className="flex gap-2">
            <Link
              href={cat ? `/foro?cat=${encodeURIComponent(cat)}` : "/foro"}
              className="rounded-md border border-black/20 px-3 py-2 text-sm hover:bg-black/5"
            >
              Reintentar
            </Link>
            <Link
              href={cat ? `/foro?cat=${encodeURIComponent(cat)}&debug=1` : "/foro?debug=1"}
              className="rounded-md border border-black/20 px-3 py-2 text-sm hover:bg-black/5"
            >
              Ver debug
            </Link>
          </div>
        </section>
      ) : threads.length === 0 ? (
        <section className="rounded-lg bg-black/5 p-6">
          <p className="text-sm">No hay hilos todavía{cat ? ` en “${cat}”` : ""}.</p>
        </section>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg bg-white">
          <Suspense>
            {threads.map((t) => (
              <li key={t.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/foro/${t.id}`} className="text-base font-semibold hover:underline">
                      {t.title}
                    </Link>
                    <div className="mt-1 text-xs opacity-70">
                      <span className="mr-2 rounded bg-black/5 px-1.5 py-0.5">{t.category}</span>
                      {t.replies_count} respuestas · {t.views} vistas
                    </div>
                  </div>
                  <div className="text-right text-xs opacity-60">
                    <div>{t.status === "open" ? "Abierto" : "Cerrado"}</div>
                    {t.last_activity && (
                      <time dateTime={t.last_activity}>
                        Últ. act.: {new Date(t.last_activity).toLocaleString()}
                      </time>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </Suspense>
        </ul>
      )}
    </main>
  );
}
