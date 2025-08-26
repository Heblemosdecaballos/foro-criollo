// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import IconHorse from "@/src/components/ui/IconHorse";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <>
      {/* FRANJA CAFÉ con contenido centrado y foto dentro (sin superposición) */}
      <section className="hero-cafe text-white">
        <div className="container py-12 md:py-16">
          <div className="grid md:grid-cols-2 items-center gap-8">
            {/* Columna izquierda: título + copy + CTA */}
            <div>
              <div className="flex items-center gap-3">
                <IconHorse size={40} />
                <h1 className="font-serif text-4xl md:text-5xl font-bold">
                  Hablando de Caballos
                </h1>
              </div>
              <p className="mt-4 max-w-xl text-white/90">
                La comunidad más grande del Caballo Criollo Colombiano
              </p>
              <Link href="/foros" className="mt-6 inline-flex btn btn-olive">
                Crear Nuevo Foro
              </Link>
            </div>

            {/* Columna derecha: tarjeta con la foto, centrada dentro de la franja */}
            <div className="flex justify-center">
              <div className="relative w-[460px] h-[260px] md:w-[520px] md:h-[300px] rounded-xl overflow-hidden ring-1 ring-white/40 shadow-xl">
                <Image
                  src="/hero/portada.jpg"  // <- RUTA DE LA FOTO
                  alt="Caballo Criollo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* (Eliminado el bloque de métricas) */}

      {/* TRES CUADROS SUPERIORES */}
      <section className="container grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <div className="card">
          <div className="card-body text-center">
            <div className="mb-3 flex justify-center">
              <IconHorse size={28} />
            </div>
            <div className="font-serif font-semibold">Expertos en Caballos</div>
            <p className="text-brown-700/80 mt-2">
              Conecta con criadores, entrenadores y expertos del caballo criollo colombiano
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl mb-3">💬</div>
            <div className="font-serif font-semibold">Foros Especializados</div>
            <p className="text-brown-700/80 mt-2">
              Participa en discusiones sobre crianza, entrenamiento, salud y competencias
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl mb-3">📚</div>
            <div className="font-serif font-semibold">Recursos Educativos</div>
            <p className="text-brown-700/80 mt-2">
              Accede a guías, artículos y recursos sobre el cuidado y manejo de caballos
            </p>
          </div>
        </div>
      </section>

      {/* TEMAS ESPECIALIZADOS */}
      <section className="container my-6">
        <h2 className="font-serif text-xl md:text-2xl text-center">Temas Especializados</h2>
        <p className="text-center text-brown-700/80 mt-2 max-w-3xl mx-auto">
          Explora nuestras áreas especializadas diseñadas para cada aspecto del caballo criollo
        </p>
      </section>

      <section className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: <span className="inline-block"><IconHorse size={24} /></span>, title: "Entrenamiento", desc: "Foros especializados en entrenamiento", href: "/foros?cat=entrenamiento" },
          { icon: "🧬", title: "Crianza y Genética", desc: "Foros especializados en crianza y genética", href: "/foros?cat=crianza" },
          { icon: "🏆", title: "Competencias", desc: "Foros especializados en competencias", href: "/foros?cat=competencias" },
          { icon: "🩺", title: "Salud Veterinaria", desc: "Foros especializados en salud veterinaria", href: "/foros?cat=salud" },
          { icon: "📜", title: "Historia y Tradición", desc: "Tradición, cultura y anécdotas", href: "/foros?cat=historia" },
          { icon: "💰", title: "Comercialización", desc: "Compra, venta y servicios", href: "/foros?cat=comercial" },
          { icon: "📺", title: "Eventos en Vivo", desc: "Transmisiones y coberturas", href: "/transmisiones" },
          { icon: "💭", title: "Experiencias", desc: "Historias de la comunidad", href: "/historias" },
        ].map((t) => (
          <a key={t.title} href={t.href} className="card hover:shadow-md transition">
            <div className="card-body text-center">
              <div className="text-3xl mb-3">{t.icon}</div>
              <div className="font-serif font-semibold">{t.title}</div>
              <p className="text-brown-700/80 mt-2 text-sm">{t.desc}</p>
            </div>
          </a>
        ))}
      </section>
    </>
  );
}
