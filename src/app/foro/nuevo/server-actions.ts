"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

function backWithError(msg: string) {
  // Redirige a la misma página con mensaje de error en querystring
  redirect(`/foro/nuevo?error=${encodeURIComponent(msg)}`);
}

/**
 * Crea un nuevo foro (thread) y redirige.
 * Importante: esta server action NO retorna valor; usa redirect() siempre.
 */
export async function createForum(formData: FormData): Promise<void> {
  const supa = createSupabaseServerClient();

  // 1) Usuario
  const {
    data: { user },
    error: userErr,
  } = await supa.auth.getUser();

  if (userErr) backWithError(userErr.message);
  if (!user) backWithError("Debes iniciar sesión para crear un foro.");

  // 2) Campos
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const content = String(formData.get("content") || "").trim(); // opcional
  const tagsCsv = String(formData.get("tags") || "").trim();
  const tags = tagsCsv
    ? tagsCsv
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if
