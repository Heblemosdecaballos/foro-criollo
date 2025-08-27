"use server";
import { supabaseServer } from "@/lib/supabase/server";

export async function createThreadAction(formData: FormData): Promise<{ ok: boolean; slug?: string; message?: string }> {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Debes iniciar sesión para crear un foro." };

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  if (!title || !content) return { ok: false, message: "Título y contenido son obligatorios." };

  const { data, error } = await supabase
    .from("threads")
    .insert({ title, content, author_id: user.id })
    .select("slug")
    .single();

  if (error || !data?.slug) {
    console.error("Create thread error:", error);
    return { ok: false, message: "Error al crear el foro." };
  }

  return { ok: true, slug: data.slug };
}
