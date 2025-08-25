// src/app/foro/nuevo/page.tsx
import Link from "next/link";
import { createForum } from "./server-actions";
import { categories } from "@/src/constants/forums"; // ajusta la ruta si tu archivo está en otra carpeta

export const dynamic = "force-dynamic";

export default function NewForumPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // Si alguna vez quieres mostrar errores vía redirect con query, aquí los capturas
  const errorMsg = searchParams?.error;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Crear nuevo foro</h1>
        <Link
          href="/foro"
          className="rounded-md border border-black/20 px-3 py-2 text-sm hover:bg-black/5"
        >
          ← Volver al foro
        </Link>
      </header>

      {errorMsg && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <form action={createForum} className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={3}
            placeholder="Ej. ¿Qué flores son seguras para los caballos?"
            className="w-full rounded-md border border-black/20 px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
            Categoría
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs opacity-70">
            Las categorías válidas están definidas en <code>src/constants/forums.ts</code>.
          </p>
        </div>

        <div>
          <label htmlFor="tags" className="mb-1 block text-sm font-medium">
            Etiquetas (opcional)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="separa, con, comas"
            className="w-full rounded-md border border-black/20 px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium">
            Contenido inicial (opcional)
          </label>
          <textarea
            id="content"
            name="content"
            rows={6}
            placeholder="Describe tu tema o pregunta..."
            className="w-full rounded-md border border-black/20 px-3 py-2 text-sm outline-none focus:ring-2"
          />
          <p className="mt-1 text-xs opacity-70">
            (Opcional) Si decides guardar el primer mensaje como comentario, descomenta el bloque en
            <code> server-actions.ts</code>.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-md border border-black/20 bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Crear foro
          </button>
        </div>
      </form>
    </main>
  );
}
