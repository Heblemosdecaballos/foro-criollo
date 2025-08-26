"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createThreadAction(formData: FormData) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Obtener usuario
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Debes iniciar sesión para crear un foro." };
  }

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const foro_id = (formData.get("foro_id") as string)?.trim() || null;

  if (!title || !content) {
    return { ok: false, message: "Título y contenido son obligatorios." };
  }

  // Si no envías foro_id, podrías crear un foro por defecto o permitir null.
  const insertPayload: any = {
    title,
    content,
    author_id: user.id,
  };
  if (foro_id) insertPayload.foro_id = foro_id;

  const { data, error } = await supabase
    .from("threads")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    console.error("Create thread error:", error);
    return {
      ok: false,
      message:
        "Error al crear el foro: " +
        (error.message || "Intenta nuevamente más tarde."),
    };
  }

  return { ok: true, id: data.id };
}
