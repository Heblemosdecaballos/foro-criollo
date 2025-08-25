// src/app/foro/page.tsx
import Link from "next/link";
import { Suspense } from "react";

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

type ThreadsResponse =
  | { ok: true; threads: Thread[] }
  | { ok: false; error?: string };

export const dynamic = "force-dynamic";

function getBaseUrl() {
  // Prioridad: NEXT_PUBLIC_SITE_URL > VERCEL_URL > localhost
  // Ejemplos válidos:
  // NEXT_PUBLIC_SITE_URL = https://hablandodecaballos.com
  // VERCEL_URL = app-hablandodecaballos.vercel.app (sin protocolo)
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

async function fetchThreadsFromApi(cat?: string): Promise<{
  threads: Thread[];
  errorMsg?: string;
  debug?: any;
}> {
  const qs = cat ? `?cat=${encodeURIComponent(cat)}` : "";
  const base = getBaseUrl();
  const url = `${base}/api/threads${qs}`;
  const debug: Record<string, any> = { base, url };

  try {
    // Petición absoluta para evitar problemas de base path en SSR
    const res = await fetch(url, {
      cache: "no-store",
      // Evitamos cualquier revalidación accidental
      next: { revalidate: 0 },
      headers: {
        // Evita caches intermedios
        "cache-control": "no-store",
      },
    });

    debug.status = res.status;

    let json: ThreadsResponse | null = null;
    try {
      json = (await res.json()) as ThreadsResponse;
    } catch (e) {
      debug.jsonParseError = (e as Error).message;
      return {
        threads: [],
        errorMsg: "No se pudo interpretar la respuesta del servidor.",
        debug,
      };
    }

    debug.json = json;

    if (!res.ok || !json || json.ok !== true) {
      return {
        threads: [],
        errorMsg:
          (json && "error" in json && json.error) ||
          `La API respondió con estado ${res.status}.`,
        debug,
      };
    }

    return { threads: json.threads || [], debug };
  } catch (e) {
    debug.throw = (e as Error).message;
    return { threads: [], errorMsg: "No se pudo cargar el foro.", debug };
  }
}

export default async function ForoPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const cat = searchParams?.cat;
  const { threads, errorMsg, debug } = await fetchThreadsFromApi(cat);

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
        {/* Agrega más categorías si están en src/constants/forums.ts */}
      </nav>

      {errorMsg ? (
        <section className="rounded-lg bg-black/5 p-6">
          <h2 className="mb-2 text-xl font-semibold">Ocurrió un error cargando el foro</h2>
          <p className="mb-3 text-sm opacity-80">{errorMsg}</p>

          {/* Bloque de depuración visible solo si NEXT_PUBLIC_DEBUG_FORO = "1" */}
          {process.env.NEXT_PUBLIC_DEBUG_FORO === "1" && (
            <pre className="mb-4 overflow-auto rounded bg-white p-3 text-xs">
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
                    <Link
                      href={`/foro/${t.id}`}
                      className="text-base font-semibold hover:underline"
                    >
                      {t.title}
                    </Link>
                    <div className="mt-1 text-xs opacity-70">
                      <span className="mr-2 rounded bg-black/5 px-1.5 py-0.5">
                        {t.category}
                      </span>
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
