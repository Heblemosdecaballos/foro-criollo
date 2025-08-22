// components/SiteHeader.tsx
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo marca */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Hablando de Caballos" className="h-8 w-8 rounded-md" />
          <span className="text-lg font-semibold tracking-tight">Hablando de Caballos</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/noticias" className="hover:underline">Noticias</Link>
          <Link href="/historias" className="hover:underline">Historias</Link>
          <Link href="/threads" className="hover:underline">Foro</Link>
          <Link
            href="/historias/nueva"
            className="hidden sm:inline-flex rounded-md px-3 py-1.5 text-white hover:opacity-95"
            style={{ backgroundColor: "rgb(var(--brand))" }}
          >
            + Publicar
          </Link>
        </nav>
      </div>
    </header>
  );
}
