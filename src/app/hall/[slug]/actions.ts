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
// --- VOTOS DEL HALL ---
// Firma dual para ser compatible con código viejo y nuevo:
// - toggleVote(slug)
// - toggleVote(profileId, slug)  ← el 1er arg se ignora, usamos siempre el slug
export async function toggleVote(slug: string): Promise<{ ok: boolean; votes: number }>;
export async function toggleVote(profileId: string, slug: string): Promise<{ ok: boolean; votes: number }>;
export async function toggleVote(a: string, b?: string) {
  const slug = b ?? a;

  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error("auth");

  // ¿ya votó?
  const { data: existing, error: selErr } = await supa
    .from("hall_votes")
    .select("hall_slug,user_id")
    .eq("hall_slug", slug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (selErr) throw selErr;

  if (existing) {
    // quitar voto
    const { error: delErr } = await supa
      .from("hall_votes")
      .delete()
      .eq("hall_slug", slug)
      .eq("user_id", user.id);
    if (delErr) throw delErr;
  } else {
    // poner voto
    const { error: insErr } = await supa
      .from("hall_votes")
      .insert({ hall_slug: slug, user_id: user.id });
    if (insErr) throw insErr;
  }

  // contar votos
  const { count } = await supa
    .from("hall_votes")
    .select("*", { head: true, count: "exact" })
    .eq("hall_slug", slug);

  // refrescar la página del hall
  revalidatePath(`/hall/${slug}`);

  return { ok: true, votes: count ?? 0 };
}
