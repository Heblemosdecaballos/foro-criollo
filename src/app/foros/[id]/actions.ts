"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
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
}

async function requireUserId() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  return user.id;
}

async function insertPost(thread_id: string, content: string, userId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("posts")
    .insert({ thread_id, content, author_id: userId });

  if (error) {
    console.error("insertPost error:", error);
    throw new Error("DB_INSERT_ERROR");
  }

  // Revalidar la página del hilo para que aparezca la nueva respuesta
  revalidatePath(`/foros/${thread_id}`);
}

/**
 * Versión compatible con useFormState (prevState, formData)
 */
export async function createPostAction(
  _prevState: any,
  formData: FormData
): Promise<{ ok: boolean; message?: string }> {
  try {
    const userId = await requireUserId();

    const thread_id = (formData.get("thread_id") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();

    if (!thread_id || !content) {
      return { ok: false, message: "Contenido obligatorio." };
    }

    await insertPost(thread_id, content, userId);
    return { ok: true };
  } catch (e: any) {
    if (e?.message === "AUTH_REQUIRED") {
      return { ok: false, message: "Debes iniciar sesión para responder." };
    }
    return { ok: false, message: "No se pudo publicar la respuesta." };
  }
}

/**
 * Versión simple (sólo formData), compatible con CommentForm
 */
export async function addCommentAction(
  formData: FormData
): Promise<{ ok: boolean; message?: string }> {
  try {
    const userId = await requireUserId();

    const thread_id = (formData.get("thread_id") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();

    if (!thread_id || !content) {
      return { ok: false, message: "Contenido obligatorio." };
    }

    await insertPost(thread_id, content, userId);
    return { ok: true };
  } catch (e: any) {
    if (e?.message === "AUTH_REQUIRED") {
      return { ok: false, message: "Debes iniciar sesión para responder." };
    }
    return { ok: false, message: "No se pudo publicar la respuesta." };
  }
}
