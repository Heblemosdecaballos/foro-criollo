"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function createThreadAction(
  formData: FormData
): Promise<{ ok: boolean; id?: string; message?: string }> {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Debes iniciar sesión para crear un foro." };
  }

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const foro_id = (formData.get("foro_id") as string)?.trim() || null;

  if (!title || !content) {
    return { ok: false, message: "Título y contenido son obligatorios." };
  }

  const payload: any = { title, content, author_id: user.id };
  if (foro_id) payload.foro_id = foro_id;

  const { data, error } = await supabase
    .from("threads")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("Create thread error:", error);
    return { ok: false, message: "Error al crear el foro." };
  }

  return { ok: true, id: data.id };
}
