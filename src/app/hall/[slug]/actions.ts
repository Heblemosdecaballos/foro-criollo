"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * Subir media al Hall (imagen, video o YouTube).
 * Uso: addMediaAction(slug, formData)
 */
export async function addMediaAction(slug: string, fd: FormData) {
  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error("auth");

  const type = String(fd.get("type") || "image");
  let storage_path: string | null = null;
  let media_url: string | null = null;

  if (type === "youtube") {
    const y = String(fd.get("youtubeUrl") || "").trim();
    if (!y) throw new Error("youtube url requerida");
    media_url = y;
  } else {
    const file = fd.get("file") as File | null;
    if (!file || file.size === 0) throw new Error("archivo requerido");
    const path = `hall/${slug}/${user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supa.storage.from("hall").upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data } = supa.storage.from("hall").getPublicUrl(path);
    storage_path = data.publicUrl;
  }

  const { error: insErr } = await supa.from("hall_media").insert({
    hall_slug: slug,
    author_id: user.id,
    media_type: type,
    storage_path,
    media_url,
  });
  if (insErr) throw insErr;

  revalidatePath(`/hall/${slug}`);
}

/**
 * Comentar en un Hall.
 * Uso: addHallComment(slug, formData)
 */
export async function addHallComment(slug: string, fd: FormData) {
  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error("auth");

  const body = String(fd.get("body") || "").trim();
  if (!body) return;

  const { error } = await supa.from("hall_comments").insert({
    hall_slug: slug,
    author_id: user.id,
    body,
  });
  if (error) throw error;

  revalidatePath(`/hall/${slug}`);
}

/* Shim opcional por compatibilidad: permite usar addYoutubeAction(slug, url) */
export async function addYoutubeAction(slug: string, youtubeUrl: string) {
  const fd = new FormData();
  fd.set("type", "youtube");
  fd.set("youtubeUrl", youtubeUrl);
  return addMediaAction(slug, fd);
}
