"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

type InsertThread = { id: string };

function redirectWithError(msg: string): never {
  redirect(`/foro/nuevo?error=${encodeURIComponent(msg)}`);
}

/**
 * Crea un nuevo foro (thread) y redirige.
 * Esta server action NO retorna valor; siempre termina en redirect().
 */
export async function createForum(formData: FormData): Promise<void> {
  const supa = createSupabaseServerClient();

  // 1) Usuario
  const {
    data: userData,
    error: userErr,
  } = await supa.auth.getUser();

  if (userErr) {
    redirectWithError(userErr.message);
  }

  const user = userData?.user;
  if (!user) {
    redirectWithError("Debes iniciar sesión para crear un foro.");
  }

  // 2) Campos
  const titleRaw = formData.get("title");
  const categoryRaw = formData.get("category");
  const contentRaw = formData.get("content"); // opcional (primer mensaje)
  const tagsRaw = formData.get("tags");       // opcional "a,b,c"

  const title = (typeof titleRaw === "string" ? titleRaw : "").trim();
  const category = (typeof categoryRaw === "string" ? categoryRaw : "").trim();
  const content = (typeof contentRaw === "string" ? contentRaw : "").trim();
  const tagsCsv = (typeof tagsRaw === "string" ? tagsRaw : "").trim();

  const tags =
    tagsCsv.length > 0
      ? tagsCsv
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];

  if (title.length < 3) {
    redirectWithError("El título es obligatorio (mínimo 3 caracteres).");
  }
  if (!category) {
    redirectWithError("Debes seleccionar una categoría.");
  }

  // Nombre visible del autor (user_metadata.full_name > email > 'Usuario')
  const author_name =
    (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) ||
    user.email ||
    "Usuario";

  // 3) Insert en threads
  const { data, error } = await supa
    .from("threads")
    .insert({
      title,
      category,
      tags,
      author_id: user.id,
      author_name, // 👈 nuevo
      status: "open",
    })
    .select("id")
    .single<InsertThread>();

  if (error) {
    redirectWithError(error.message);
  }

  // 4) (Opcional) Crear primer comentario con "content"
  if (content) {
    const { error: postErr } = await supa.from("thread_comments").insert({
      thread_id: data!.id,
      author_id: user.id,
      author_name, // 👈 nuevo
      text: content,
    });
    if (postErr) {
      redirectWithError(postErr.message);
    }
  }

  // 5) Revalidar y redirigir al listado
  revalidatePath("/foro");
  redirect("/foro");
}
