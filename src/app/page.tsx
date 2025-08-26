// src/app/page.tsx
import Link from "next/link";
import { Card, CardBody } from "@/src/components/ui/Card";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <>
      {/* Franja café del hero con el tono exacto */}
      <section className="hero-cafe text-white">
        <div className="container py-14 md:py-18 relative">
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

          {/*
          // Si quieres la foto en la misma franja (overlay derecha):
          <div className="hidden md:block pointer-events-auto absolute right-0 bottom-[-35px] w-[420px] h-[220px] rounded-xl overflow-hidden ring-1 ring-white/40 shadow-xl">
            <Image src="/hero/portada.jpg" alt="Caballo Criollo" fill className="object-cover" priority />
          </div>
          */}
        </div>
      </section>

      {/* Métricas (cajas blancas) */}
      <section className="container grid grid-cols-1 md:grid-cols-3 gap-4 -mt-8 mb-8">
        {[
          { big: "500+", small: "Miembros Activos" },
          { big: "50+", small: "Foros Especializados" },
          { big: "24/7", small: "Comunidad Activa" },
        ].map((m) => (
          <Card key={m.big}>
            <CardBody className="text-center">
              <div className="text-3xl font-bold">{m.big}</div>
              <div className="text-sm mt-1 text-brown-700/70">{m.small}</div>
            </CardBody>
          </Card>
        ))}
      </section>

      {/* Resto de secciones… */}
    </>
  );
}
