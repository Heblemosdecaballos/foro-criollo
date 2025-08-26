// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody } from "@/src/components/ui/Card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <>
      {/* FRANJA CAFÉ EXISTENTE (con overlay de foto a la derecha) */}
      <section className="relative w-full">
        {/* Tu franja café: usa tu clase/estilos previos.
            Si antes usabas un gradiente, aquí tienes uno muy similar.
            Puedes reemplazarlo por tu clase exacta si ya la tenías (p.ej. bg-[...]). */}
        <div className="w-full bg-gradient-to-r from-[#8C5A3E] to-[#5C3D2B] text-white">
          <div className="container py-12 md:py-16">
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              Hablando de Caballos
            </h1>
            <p className="mt-3 text-white/90 max-w-2xl">
              La comunidad más grande del Caballo Criollo Colombiano
            </p>
            <Link
              href="/foros"
              className="mt-6 inline-flex rounded-lg bg-white text-brown-800 px-4 py-2 text-sm font-medium hover:bg-cream-200"
            >
              Crear Nuevo Foro
            </Link>
          </div>
        </div>

        {/* RECUADRO FOTO: posicionado encima de la franja, a la derecha */}
        <div className="pointer-events-none absolute inset-0">
          <div className="container h-full relative">
            <div
              className="
                pointer-events-auto
                absolute right-0 md:right-4 bottom-[-30px] md:bottom-[-40px]
                w-[280px] md:w-[420px] h-[160px] md:h-[220px]
                rounded-xl overflow-hidden ring-1 ring-white/40 shadow-xl
              "
            >
              <Image
                src="/hero/portada.jpg"   // <- tu foto anterior
                alt="Caballo Criollo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* MÉTRICAS (igual que antes, con compensación por la tarjeta flotante) */}
      <section className="container grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 md:mt-24 mb-8">
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

      {/* (Resto de tu home tal cual lo tenías) */}
    </>
  );
}
