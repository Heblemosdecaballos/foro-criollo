// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <>
      {/* FRANJA CAFÉ */}
      <section className="hero-cafe text-white relative">
        <div className="container py-14 md:py-18">
          <div className="flex items-center gap-3">
            <Image src="/brand/horse.png" alt="Caballo" width={40} height={40} />
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              Hablando de Caballos
            </h1>
          </div>
          <p className="mt-4 max-w-2xl text-white/90">
            La comunidad más grande del Caballo Criollo Colombiano
          </p>
          <Link href="/foros" className="mt-6 inline-flex btn btn-olive">
            Crear Nuevo Foro
          </Link>
        </div>

        {/* TARJETA FOTO SUPERPUESTA */}
        <div className="container relative">
          <div className="hero-photo-card">
            <Image src="/hero/portada.jpg" alt="Caballo Criollo" fill className="object-cover" priority />
          </div>
        </div>
      </section>

      {/* MÉTRICAS */}
      <section className="container grid grid-cols-1 md:grid-cols-3 gap-4 -mt-8 mb-8">
        {[
          { big: "500+", small: "Miembros Activos" },
          { big: "50+", small: "Foros Especializados" },
          { big: "24/7", small: "Comunidad Activa" },
        ].map((m) => (
          <div key={m.big} className="card">
            <div className="card-body text-center">
              <div className="text-3xl font-bold">{m.big}</div>
              <div className="text-sm mt-1 text-brown-700/70">{m.small}</div>
            </div>
          </div>
        ))}
      </section>

      {/* TRES CUADROS SUPERIORES */}
      <section className="container grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        {[
          { icon: "🐎", title: "Expertos en Caballos", desc: "Conecta con criadores, entrenadores y expertos del caballo criollo colombiano" },
          { icon: "💬", title: "Foros Especializados", desc: "Participa en discusiones sobre crianza, entrenamiento, salud y competencias" },
          { icon: "📚", title: "Recursos Educativos", desc: "Accede a guías, artículos y recursos sobre el cuidado y manejo de caballos" },
        ].map((c) => (
          <div key={c.title} className="card">
            <div className="card-body text-center">
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="font-serif font-semibold">{c.title}</div>
              <p className="text-brown-700/80 mt-2">{c.desc}</p>
            </div>
          </div>
        ))}
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
          { icon: "🧬", title: "Crianza y Genética", desc: "Foros especializados en crianza y genética", href: "/foros?cat=crianza" },
          { icon: "🐎", title: "Entrenamiento", desc: "Foros especializados en entrenamiento", href: "/foros?cat=entrenamiento" },
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
