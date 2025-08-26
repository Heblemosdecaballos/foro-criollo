"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function addCommentAction(
  formData: FormData
): Promise<{ ok: boolean; message?: string }> {
  const supabase = supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Debes iniciar sesión para responder." };

  const thread_id = (formData.get("thread_id") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();

  if (!thread_id || !content) {
    return { ok: false, message: "Contenido obligatorio." };
  }

  const { error } = await supabase
    .from("posts")
    .insert({ thread_id, content, author_id: user.id });

  if (error) {
    console.error("addCommentAction error:", error);
    return { ok: false, message: "No se pudo publicar la respuesta." };
  }

  revalidatePath(`/foros/${thread_id}`);
  return { ok: true };
}
