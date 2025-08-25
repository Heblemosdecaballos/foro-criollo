// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardBody } from "@/src/components/ui/Card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero-grad text-white">
        <div className="container py-16 md:py-20">
          <div className="flex items-center gap-4">
            <Image src="/brand/horse.png" alt="Caballo" width={48} height={48} />
            <h1 className="font-serif text-4xl md:text-5xl font-bold">Hablando de Caballos</h1>
          </div>
          <p className="mt-4 max-w-2xl text-white/90">
            La comunidad más grande del Caballo Criollo Colombiano
          </p>
          <Link href="/foros" className="mt-6 inline-flex btn btn-olive bg-white text-brown-800 hover:bg-cream-200">
            Crear Nuevo Foro
          </Link>
        </div>
      </section>

      {/* MÉTRICAS */}
      <section className="container grid grid-cols-1 md:grid-cols-3 gap-4 -mt-8 mb-8">
        {[
          { big: "500+", small: "Miembros Activos" },
          { big: "50+", small: "Foros Especializados" },
          { big: "24/7", small: "Comunidad Activa" },
        ].map((m) => (
          <Card key={m.big} className="bg-white">
            <CardBody className="text-center">
              <div className="text-3xl font-bold">{m.big}</div>
              <div className="text-sm mt-1 text-brown-700/70">{m.small}</div>
            </CardBody>
          </Card>
        ))}
      </section>

      {/* TEMAS ESPECIALIZADOS */}
      <section className="container my-10">
        <h2 className="font-serif text-2xl font-semibold text-center mb-1">Temas Especializados</h2>
        <p className="text-center text-brown-700/80 mb-6">
          Explora nuestras áreas especializadas diseñadas para cada aspecto del caballo criollo
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Crianza y Genética", href: "/foros?cat=crianza" },
            { title: "Entrenamiento", href: "/foros?cat=entrenamiento" },
            { title: "Competencias", href: "/foros?cat=competencias" },
            { title: "Salud Veterinaria", href: "/foros?cat=salud" },
            { title: "Historia y Tradición", href: "/foros?cat=historia" },
            { title: "Comercialización", href: "/foros?cat=comercial" },
          ].map((t) => (
            <Card key={t.title} className="hover:shadow-md transition">
              <CardBody className="text-center">
                <div className="font-serif font-semibold mb-1">{t.title}</div>
                <Link href={t.href} className="text-sm underline">Ver</Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
