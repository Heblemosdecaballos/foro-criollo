// components/SiteHeader.tsx
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4">
        <Link href="/" className="text-xl font-semibold">Hablando de Caballos</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/historias" className="hover:underline">Historias</Link>
          <Link href="/threads" className="hover:underline">Foro</Link>
          <Link href="/historias/nueva" className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">
            + Publicar
          </Link>
        </nav>
      </div>
    </header>
  );
}
