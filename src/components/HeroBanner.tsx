// src/components/HeroBanner.tsx
export default function HeroBanner() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container flex items-center justify-between gap-6 py-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Hablando de Caballos</h1>
          <p className="opacity-90">Comunidad, noticias, foros y Hall of Fame</p>
        </div>
        {/* Reemplaza /hero-strip.png por tu imagen */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-strip.png"
          alt="HDC"
          className="h-16 md:h-20 w-auto rounded-lg shadow"
        />
      </div>
    </section>
  );
}
