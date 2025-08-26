// src/app/foros/nuevo/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/src/lib/supabase/server";

/**
 * Server Action para crear un hilo nuevo.
 * Ajusta el nombre de la tabla/columnas a tu esquema real si difiere.
 */
export async function createThreadAction(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const category = String(formData.get("category") || "").trim();

  if (!title || !content) {
    // si quieres, podrías redirigir con ?error=
    redirect("/foros/nuevo");
  }

  const supabase = createSupabaseServer();

  // usuario actual (para author_id / author_name si aplica)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ⬇️ AJUSTA el nombre de la tabla y columnas si tu esquema es distinto
  // Ejemplos comunes: "threads", "forum_threads", "posts"
  const { error } = await supabase.from("threads").insert({
    title,
    content,
    category,
    author_id: user?.id ?? null,
  });

  // TODO: manejar el error como prefieras
  // por ahora siempre volvemos al listado
  redirect("/foros");
}
