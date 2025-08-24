// src/components/HeroBanner.tsx
import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container flex items-center justify-between gap-6 py-6">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold">Hablando de Caballos</h1>
          <p className="opacity-90">
            Comunidad, noticias, foros e historias del Caballo Criollo Colombiano.
          </p>
        </div>

        {/* Área reservada (si no hay imagen, se ve un placeholder) */}
        <div className="shrink-0">
          <div className="relative w-[220px] h-[88px] md:w-[300px] md:h-[120px] rounded-lg overflow-hidden bg-primary-foreground/10">
            {/* Pon tu imagen en /public/hero/strip.webp */}
            <Image
              src="/hero/strip.webp"
              alt="HDC"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 220px, 300px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
