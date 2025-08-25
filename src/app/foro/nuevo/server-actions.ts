"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

type CreateForumResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createForum(formData: FormData): Promise<CreateForumResult> {
  const supa = createSupabaseServerClient();

  // Usuario
  const {
    data: { user },
    error: userErr,
  } = await supa.auth.getUser();

  if (userErr) {
    return { ok: false, error: userErr.message };
  }
  if (!user) {
    return { ok: false, error: "Debes iniciar sesión para crear un foro." };
  }

  // Campos
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const content = String(formData.get("content") || "").trim(); // opcional: si luego guardas en posts
  const tagsCsv = String(formData.get("tags") || "").trim();
  const tags = tagsCsv
    ? tagsCsv
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (!title || title.length < 3) {
    return { ok: false, error: "El título es obligatorio (mínimo 3 caracteres)." };
  }
  if (!category) {
    return { ok: false, error: "Debes seleccionar una categoría." };
  }

  // Inserción en threads
  const { data, error } = await supa
    .from("threads")
    .insert({
      title,
      category,
      tags,
      author_id: user.id,
      status: "open",
      // Si tu tabla tiene columnas con DEFAULT, no es necesario enviarlas aquí
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  // (Opcional) Si quieres crear el primer post con "content", descomenta y ajusta:
  // if (content) {
  //   const { error: postErr } = await supa.from("thread_comments").insert({
  //     thread_id: data.id,
  //     author_id: user.id,
  //     text: content,
  //   });
  //   if (postErr) {
  //     return { ok: false, error: postErr.message };
  //   }
  // }

  // Revalida y redirige
  revalidatePath("/foro");
  redirect("/foro");

  // (Nota: redirect corta la ejecución; la línea siguiente no se ejecutará)
  // Se deja por tipado estricto
  // eslint-disable-next-line no-unreachable
  return { ok: true, id: data.id };
}
