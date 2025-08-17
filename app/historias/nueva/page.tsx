// app/historias/nueva/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/utils/supabase/server";

// Forzamos evaluación en servidor en cada request
export const dynamic = "force-dynamic";

export default async function NuevaHistoriaPage() {
  // Sesión del lado servidor (lee y ESCRIBE cookies correctamente)
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay sesión: redirige a /auth y, al terminar, vuelve aquí
  if (!user) {
    redirect("/auth?redirect=/historias/nueva");
  }

  // 🔽 Sustituye el contenido del <section> por tu formulario real
  return (
    <main className="container-page py-8">
      <h1>Nueva historia</h1>

      <section className="card p-6 mt-4 space-y-4">
        <p className="text-sm text-black/70 dark:text-white/70">
          (Placeholder) Ya estás autenticado. Aquí va tu formulario de publicación
          (título, texto, subida de imágenes/videos y botón “Publicar”).
