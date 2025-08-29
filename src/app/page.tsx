import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ======= HÉROE (franja café con grid 7/5) ======= */}
      <section
        // Franja café (sin CSS externo)
        style={{ background: "linear-gradient(180deg,#9A623E 0%, #B77A51 100%)" }}
        className="relative shadow-inner"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* IZQUIERDA: título + descripción + CTA */}
          <div className="lg:col-span-7 text-left">
            {/* ⬇⬇ Usa tu H1 original (puedes reemplazar este bloque por el tuyo tal cual) */}
            <h1 className="font-serif text-white text-4xl md:text-6xl font-extrabold leading-tight">
              Hablando de Caballos
            </h1>
            <p className="text-white/90 text-lg md:text-xl mt-3">
              La comunidad más grande del Caballo Criollo Colombiano
            </p>
            <Link
              href="/foros/nuevo"
              className="inline-block mt-6 rounded-xl bg-green-700 text-white px-5 py-3 shadow hover:shadow-md"
            >
              Crear Nuevo Foro
            </Link>
          </div>

          {/* DERECHA: foto central (no se pierde) */}
          <div className="lg:col-span-5">
            {/* ⬇⬇ CAMBIA el src por el de tu foto actual si es distinto */}
            <img
              src="/media/hero.jpg"
              alt="Exhibición de caballos"
              className="w-full h-auto rounded-2xl shadow-xl"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ======= CATEGORÍAS / SECCIONES SIGUIENTES ======= */}
      <section className="mx-auto max-w-7xl px-4 pt-8 md:pt-10">
        {/*
          ⬇⬇ Aquí pega TODO tu bloque de:
            - 'Expertos / Foros especializados / Recursos' (las 3 cards grandes)
            - Título "Temas Especializados" + descripción
            - Grilla de categorías
          SIN CAMBIAR tu JSX interno. Solo queda envuelto en este <section> para que no se monte con la franja.
        */}

        {/* EJEMPLO mínimo — BORRAR y reemplazar por tu contenido real */}
        {/* <TusCardsIntro /> */}
        {/* <TituloTemasEspecializados /> */}
        {/* <GrillaCategorias /> */}
      </section>

      {/* Si tienes más secciones debajo, déjalas tal cual */}
    </>
  );
}
