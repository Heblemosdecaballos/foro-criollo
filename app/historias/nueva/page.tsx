// app/historias/nueva/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/utils/supabase/server"; // ⬅️ ÚNICA importación

// Fuerza SSR en cada request (lee/escribe cookies siempre)
export const dynamic = "force-dynamic";

export default async function NuevaHistoriaPage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?redirect=/historias/nueva");
  }

  // 🔽 Reemplaza este placeholder por tu formulario real
  return (
    <main className="container-page py-8">
      <h1>Nueva historia</h1>

      <section className="card p-6 mt-4 space-y-4">
        <p className="text-sm text-black/70 dark:text-white/70">
          (Placeholder) Ya estás autenticado. Aquí debe ir tu formulario para
          publicar (título, texto, subida de imágenes/videos y botón “Publicar”).
        </p>

        <div className="grid gap-3">
          <label className="text-sm font-medium">Título (opcional)</label>
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Escribe un título…"
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium">Texto (opcional)</label>
          <textarea
            rows={6}
            className="rounded-xl border px-3 py-2"
            placeholder="Escribe tu historia…"
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium">
            Sube imágenes o videos (placeholder)
          </label>
          <div className="rounded-xl border px-4 py-10 text-center opacity-60">
            Aquí va tu componente de subida.
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn-brand">Publicar</button>
        </div>
      </section>
    </main>
  );
}
