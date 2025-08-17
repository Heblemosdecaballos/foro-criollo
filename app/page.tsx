import AdSlot from "../components/ads/AdSlot";
import Link from "next/link";

export default async function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="bg-gradient-to-br from-brand/90 to-brand/70 text-brandfg">
        <div className="container-page py-12 grid gap-6 md:grid-cols-[1fr,320px]">
          <div className="space-y-4">
            <h1>Hablando de Caballos</h1>
            <p className="max-w-2xl text-white/90">
              Comunidad, foro, historias y noticias del Caballo Criollo Colombiano.
              Comparte tus experiencias, fotos y videos.
            </p>
            <div className="flex gap-2">
              <Link href="/historias/nueva" className="btn-brand">Publicar una historia</Link>
              <Link href="/threads" className="btn-outline text-white">Ver el foro</Link>
            </div>
          </div>

          <div className="card overflow-hidden">
            {/* Banner HERO (imagen o HTML) */}
            <AdSlot slot="hero" />
          </div>
        </div>
      </section>

      {/* FEED + SIDEBAR */}
      <section className="container-page py-10 grid gap-8 md:grid-cols-[1fr,320px]">
        <div className="space-y-4">
          <h2>Noticias</h2>
          <div className="card p-6 text-sm text-black/60 dark:text-white/60">
            Sin noticias aún
          </div>

          <div className="flex justify-end">
            <Link href="/noticias" className="text-brand hover:underline">Ver todas</Link>
          </div>

          <h2 className="mt-10">Últimos hilos del foro</h2>
          {/* Tu lista real ya existe; placeholder rápido */}
          <div className="space-y-3">
            <div className="card p-4">Hilo de prueba moderación</div>
            <div className="card p-4">Mundial</div>
            <div className="card p-4">Campeonato Yeguas Trochadoras</div>
          </div>

          <div className="flex justify-end">
            <Link href="/threads" className="text-brand hover:underline">Ver todos</Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card p-3">
            <AdSlot slot="sidebar" />
          </div>
          <div className="card p-3">
            <AdSlot slot="sidebar-2" />
          </div>
        </aside>
      </section>
    </main>
  );
}
