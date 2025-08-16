// components/SiteHeader.tsx
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          <span className="rounded bg-emerald-600 px-2 py-0.5 text-white">HC</span>{" "}
          Hablando de Caballos
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/noticias" className="hover:underline">Noticias</Link>
          <Link href="/historias" className="hover:underline">Historias</Link>
          <Link href="/threads" className="hover:underline">Foro</Link>
          <Link
            href="/historias/nueva"
            className="hidden sm:inline-flex rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
          >
            + Publicar
          </Link>
        </nav>
      </div>
    </header>
  );
}
