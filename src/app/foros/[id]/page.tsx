// src/app/foros/[id]/page.tsx
import Link from "next/link";

export default function ForoDetalle({ params }: { params: { id: string } }) {
  return (
    <main className="container py-12">
      <h1 className="font-serif text-2xl text-brown-800">Foro: {params.id}</h1>
      <p className="text-brown-700/80 mt-2">
        (Vista de detalle en construcción)
      </p>
      <Link href="/foros" className="underline mt-4 inline-block">
        ← Volver a Foros
      </Link>
    </main>
  );
}
