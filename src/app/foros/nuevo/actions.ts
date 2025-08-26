"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  // 👇 Redirección inmediata al detalle del hilo
  redirect(`/foros/${data.id}`);
}
