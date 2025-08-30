import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ======= HÉROE (franja café + texto izq + foto der) ======= */}
      <section
        style={{ background: "linear-gradient(180deg,#9A623E 0%, #B77A51 100%)" }}
        className="relative"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* IZQUIERDA: título + descripción + CTA */}
          <div className="lg:col-span-7">
            {/* Caballo grande junto al título */}
            <div className="flex items-center gap-4">
              <img
                src="/brand/horse.png"   // <- public/brand/horse.png
                alt="Caballo de marca"
                className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20"
              />
              <h1 className="font-serif text-white text-4xl md:text-6xl font-extrabold leading-tight m-0">
                Hablando de Caballos
              </h1>
            </div>

            <p className="text-white/90 text-lg md:text-xl mt-4">
              La comunidad más grande del Caballo Criollo Colombiano
            </p>

            <Link
              href="/foros/nuevo"
              className="inline-block mt-6 rounded-xl bg-green-700 text-white px-5 py-3 shadow hover:shadow-md"
            >
              Crear Nuevo Foro
            </Link>
          </div>

          {/* DERECHA: FOTO CENTRAL (mantiene tu ruta oficial) */}
          <div className="lg:col-span-5">
            <img
              src="/hero/portada.jpg"    // <- public/hero/portada.jpg
              alt="Exhibición de caballos"
              className="w-full h-auto rounded-2xl shadow-xl"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ======= 3 CARDS INTRO ======= */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 – Expertos en Caballos (con el caballo de marca) */}
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm border">
            <div className="mb-2">
              <img
                src="/brand/horse.png"   // <- public/brand/horse.png
                alt="Caballo"
                className="w-10 h-10"
              />
            </div>
            <h3 className="font-serif text-lg font-semibold">Expertos en Caballos</h3>
            <p className="text-sm text-neutral-700 mt-1">
              Conecta con criadores, entrenadores y expertos del caballo criollo colombiano
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm border">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-serif text-lg font-semibold">Foros Especializados</h3>
            <p className="text-sm text-neutral-700 mt-1">
              Participa en discusiones sobre crianza, entrenamiento, salud y competencias
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm border">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-serif text-lg font-semibold">Recursos Educativos</h3>
            <p className="text-sm text-neutral-700 mt-1">
              Accede a guías, artículos y recursos sobre el cuidado y manejo de caballos
            </p>
          </div>
        </div>
      </section>

      {/* ======= TEMAS ESPECIALIZADOS ======= */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold">Temas Especializados</h2>
          <p className="text-neutral-700 mt-2 max-w-3xl mx-auto">
            Explora nuestras áreas especializadas diseñadas para cada aspecto del caballo criollo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardTema icon="🐎" title="Entrenamiento" desc="Foros especializados en entrenamiento" />
          <CardTema icon="🧬" title="Crianza y Genética" desc="Foros especializados en crianza y genética" />
          <CardTema icon="🏆" title="Competencias" desc="Foros especializados en competencias" />
          <CardTema icon="🩺" title="Salud Veterinaria" desc="Foros especializados en salud veterinaria" />
          <CardTema icon="📜" title="Historia y Tradición" desc="Tradición, cultura y anécdotas" />
          <CardTema icon="💰" title="Comercialización" desc="Compra, venta y servicios" />
          <CardTema icon="📺" title="Eventos en Vivo" desc="Transmisiones y coberturas" />
          <CardTema icon="☁️" title="Experiencias" desc="Historias de la comunidad" />
        </div>
      </section>
    </>
  );
}

function CardTema({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-6 shadow-sm border hover:shadow-md transition">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-serif text-base md:text-lg font-semibold">{title}</h3>
      <p className="text-sm text-neutral-700 mt-1">{desc}</p>
    </div>
  );
}
