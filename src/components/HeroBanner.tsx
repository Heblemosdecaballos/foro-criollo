// src/components/HeroBanner.tsx
// NO define colores ni alturas: los toma de CSS (.hero-strip)
// y solo añade la imagen a la derecha sin alterar tu franja.

export default function HeroBanner() {
  return (
    <section className="hero-strip">
      <div className="container h-[var(--hero-strip-h,56px)] flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold">Hablando de Caballos</h1>
          <p className="text-sm opacity-90">Comunidad, noticias, foros e historias</p>
        </div>

        {/* Imagen dentro de la franja (ajusta el src si usas otro nombre) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/strip.webp"
          alt="HDC"
          className="h-[calc(var(--hero-strip-h,56px)-12px)] w-auto object-contain"
        />
      </div>
    </section>
  );
}
