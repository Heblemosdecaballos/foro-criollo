// src/app/foro/nuevo/page.tsx
import { createForum } from "./server-actions";
import { categories } from "@/constants/forums";

export const dynamic = "force-dynamic";

export default function NewForumPage() {
  return (
    <main className="container py-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Crear foro</h1>

      <form action={createForum} className="space-y-3 bg-white/70 p-4 rounded border">
        <label className="block">
          <span className="text-sm">Título</span>
          <input name="title" required className="w-full border rounded px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm">Categoría</span>
          <select name="category" required className="w-full border rounded px-3 py-2">
            <option value="">Selecciona…</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Descripción</span>
          <textarea name="content" rows={8} className="w-full border rounded px-3 py-2" />
        </label>

        <button className="px-3 py-2 rounded bg-[var(--brand-brown)] text-white">Publicar foro</button>
      </form>
    </main>
  );
}
