// No usa bg-primary; toma color/altura de CSS (.hero-strip)
export default function HeroBanner() {
  return (
    <section className="hero-strip">
      <div className="container inner">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold">Hablando de Caballos</h1>
          <p className="opacity-90">Comunidad, noticias, foros e historias del Caballo Criollo Colombiano.</p>
        </div>
        {/* Ajusta el src si tu archivo se llama distinto */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero/strip.webp" alt="HDC" className="hero-img" />
      </div>
    </section>
  );
}
