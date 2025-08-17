// app/historias/nueva/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "../../../utils/supabase/server";

// Forzamos evaluación en el servidor en cada request, así siempre
// leemos/escribimos cookies actualizadas de Supabase.
export const dynamic = "force-dynamic";

export default async function NuevaHistoriaPage() {
  // Lee la sesión del lado servidor (con escritura de cookies habilitada)
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay sesión, redirige a /auth y vuelve aquí al terminar
  if (!user) {
    redirect("/auth?redirect=/historias/nueva");
  }

  // 🔽 Si ya tienes tu formulario, ponlo dentro del <section> y elimina el placeholder.
  return (
    <main className="container-page py-8">
      <h1>Nueva historia</h1>

      {/* ────────────────────────────────────────────────────────────────
         REEMPLAZA EL CONTENIDO DE ESTE <section> POR TU FORMULARIO REAL
         ──────────────────────────────────────────────────────────────── */}
      <section className="card p-6 mt-4 space-y-4">
        <p className="text-sm text-black/70 dark:text-white/70">
          (Placeholder) Estás autenticado. Aquí debe ir tu formulario actual para
          publicar la historia (título, texto, subida de imágenes/videos y el botón
          “Publicar”). Este placeholder solo confirma que la protección de acceso
          funciona y que ya no aparecerán alertas de “auth”.
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
            Aquí va tu componente de subida. (Reemplázalo por el que ya usas)
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn-brand">Publicar</button>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────── */}
    </main>
  );
}
