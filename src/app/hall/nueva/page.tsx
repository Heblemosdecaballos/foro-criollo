// src/app/hall/nueva/page.tsx
import NewHallForm from "./NewHallForm";

export default function Page({
  searchParams,
}: {
  searchParams?: { andar?: string };
}) {
  const defaultAndar = searchParams?.andar; // p.ej. /hall/nueva?andar=paso-fino

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl md:text-3xl mb-4">Nuevo Ejemplar</h1>
      <NewHallForm defaultAndar={defaultAndar} />
    </div>
  );
}
