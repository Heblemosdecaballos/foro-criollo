"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export type ActionResp = { ok: boolean; id?: string; error?: string };

export async function createStory(fd: FormData): Promise<ActionResp> {
  try {
    const title = String(fd.get("title") || "").trim();
    const content = String(fd.get("content") || "").trim();
    const mode = String(fd.get("coverMode") || "upload");

    if (!title || !content) {
      return { ok: false, error: "Título y contenido son obligatorios." };
    }

    const supa = createSupabaseServerClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return { ok: false, error: "Debes iniciar sesión." };

    let cover_path: string | null = null;

    if (mode === "upload") {
      const file = fd.get("coverFile") as File | null;
      if (file && file.size > 0) {
        const safeName = (file.name || "cover").replace(/\s+/g, "_");
        const path = `stories/${user.id}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supa.storage
          .from("stories")
          .upload(path, file, { upsert: true });
        if (upErr) return { ok: false, error: upErr.message };
        const { data } = supa.storage.from("stories").getPublicUrl(path);
        cover_path = data.publicUrl;
      }
    } else {
      const url = String(fd.get("coverUrl") || "").trim();
      if (url) cover_path = url;
    }

    const { data: row, error } = await supa
      .from("stories")
      .insert({
        title,
        content,
        cover_path,
        author_id: user.id,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };

    revalidatePath("/historias");
    revalidatePath("/");

    return { ok: true, id: row?.id };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Error desconocido" };
  }
}

/** Alias para compatibilidad con código existente */
export async function createStoryAction(fd: FormData): Promise<ActionResp> {
  return createStory(fd);
}
