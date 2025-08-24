import Link from "next/link";
import HeroBanner from "@/components/HeroBanner";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Cargas seguras (si fallan, mostramos vacíos sin romper SSR)
  const [nRes, tRes] = await Promise.allSettled([
    fetch("/api/noticias", { cache: "no-store" }),
    fetch("/api/threads",  { cache: "no-store" }),
  ]);

  const news = nRes.status === "fulfilled" && nRes.value.ok ? (await nRes.value.json()).posts ?? [] : [];
  const threads = tRes.status === "fulfilled" && tRes.value.ok ? (await tRes.value.json()).threads ?? [] : [];

  return (
    <>
      <HeroBanner />

      <div className="container py-6 space-y-10">
        {/* Grid de previos de secciones */}
        <section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/foro" className="border rounded p-4 hover:shadow-sm transition">
              <h3 className="font-semibold">Foro</h3>
              <p className="opacity-80 text-sm">Participa en los hilos de la comunidad.</p>
              <div className="text-xs muted-date mt-2">
                {threads.length ? `Último: ${new Date(threads[0].created_at).toLocaleString()}` : "Aún no hay hilos."}
              </div>
            </Link>

            <Link href="/noticias" className="border rounded p-4 hover:shadow-sm transition">
              <h3 className="font-semibold">Noticias</h3>
              <p className="opacity-80 text-sm">Lo más reciente del mundo equino.</p>
              <div className="text-xs muted-date mt-2">
                {news.length ? `Última: ${new Date(news[0].created_at).toLocaleString()}` : "Aún no hay noticias."}
              </div>
            </Link>

            <Link href="/historias" className="border rounded p-4 hover:shadow-sm transition">
              <h3 className="font-semibold">Historias</h3>
              <p className="opacity-80 text-sm">Comparte tus experiencias, fotos y videos.</p>
            </Link>

            <Link href="/hall" className="border rounded p-4 hover:shadow-sm transition">
              <h3 className="font-semibold">Hall of Fame</h3>
              <p className="opacity-80 text-sm">Los mejores andares y momentos.</p>
            </Link>

            <Link href="/en-vivo" className="border rounded p-4 hover:shadow-sm transition">
              <h3 className="font-semibold">En vivo</h3>
              <p className="opacity-80 text-sm">Transmisiones y eventos en directo.</p>
            </Link>
          </div>
        </section>

        {/* Listado breve de noticias y foros (como antes) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Noticias</h2>
            <Link href="/noticias" className="text-sm text-muted-foreground hover:text-foreground">Ver todas</Link>
          </div>
          <ul className="grid md:grid-cols-2 gap-4">
            {news.slice(0,4).map((p:any)=>(
              <li key={p.id} className="border rounded p-4">
                <h3 className="font-medium">{p.title}</h3>
                {p.cover_path && <img src={p.cover_path} alt="" className="w-full h-auto rounded mt-2" />}
                {p.content && <p className="mt-2 opacity-80 line-clamp-3">{p.content}</p>}
                <div className="text-xs muted-date mt-1">{new Date(p.created_at).toLocaleString()}</div>
              </li>
            ))}
            {!news.length && <p className="opacity-70">Aún no hay noticias.</p>}
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Foros</h2>
            <Link href="/foro" className="text-sm text-muted-foreground hover:text-foreground">Ver todos</Link>
          </div>
          <ul className="space-y-3">
            {threads.slice(0,5).map((t:any)=>(
              <li key={t.id} className="border rounded p-3">
                <Link href={`/threads/${t.id}`} className="font-medium hover:underline">{t.title}</Link>
                <div className="text-xs muted-date mt-1">{new Date(t.created_at).toLocaleString()}</div>
              </li>
            ))}
            {!threads.length && <p className="opacity-70">Aún no hay hilos.</p>}
          </ul>
        </section>
      </div>
    </>
  );
}
