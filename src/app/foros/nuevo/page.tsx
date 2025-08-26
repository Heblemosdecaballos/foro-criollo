// src/app/foro/nuevo/page.tsx
import Link from "next/link";

export default function CrearForo() {
  return (
    <main className="container py-12">
      <h1 className="font-serif text-2xl text-brown-800">Crear Nuevo Foro</h1>
      <p className="text-brown-700/80 mt-2">
        (Formulario en construcción)
      </p>
      <Link href="/foros" className="underline mt-4 inline-block">
        ← Volver a Foros
      </Link>
    </main>
  );
}
