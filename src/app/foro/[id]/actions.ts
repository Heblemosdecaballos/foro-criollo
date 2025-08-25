"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

function backWithError(id: string, msg: string): never {
  redirect(`/foro/${id}?error=${encodeURIComponent(msg)}`);
}

/**
 * Agrega un comentario a un hilo.
 * Espera el campo "text" en el FormData (coincide con la columna thread_comments.text).
 */
export async function addCommentAction(threadId: string, formData: FormData): Promise<void> {
  const supa = createSupabaseServerClient();

  // Usuario
  const {
    data: { user },
    error: userErr,
  } = await supa.auth.getUser();

  if (userErr) backWithError(threadId, userErr.message);
  if (!user) backWithError(threadId, "Debes iniciar sesión para comentar.");

  // Campos
  const textRaw = formData.get("text");
  const text = (typeof textRaw === "string" ? textRaw : "").trim();

  if (text.length === 0) backWithError(threadId, "El comentario no puede estar vacío.");

  // Insert
  const { error } = await supa.from("thread_comments").insert({
    thread_id: threadId,
    author_id: user.id,
    text, // <- IMPORTANT: columna 'text'
  });

  if (error) backWithError(threadId, error.message);

  // Revalida y vuelve al hilo
  revalidatePath(`/foro/${threadId}`);
  redirect(`/foro/${threadId}`);
}
