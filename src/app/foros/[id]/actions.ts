"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";

export async function addCommentAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
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

  // Auth
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false, message: "Debes iniciar sesión para responder." };
  }

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

  // Invalida la caché del hilo para que aparezca la nueva respuesta
  revalidatePath(`/foros/${thread_id}`);
  return { ok: true };
}
