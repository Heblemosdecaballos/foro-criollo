"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/** Util: nombre visible del usuario */
async function getSessionUser() {
  const supa = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supa.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("Debes iniciar sesión.");
  const author_name =
    (user.user_metadata &&
      (user.user_metadata.full_name || user.user_metadata.name)) ||
    user.email ||
    "Usuario";
  return { supa, user, author_name };
}

/** Subir archivo (imagen/video) al bucket público 'hall' */
export async function addMediaAction(slug: string, fd: FormData) {
  const { supa, user, author_name } = await getSessionUser();

  const file = fd.get("file") as File | null;
  const type = (fd.get("type") as string) || "image"; // 'image' | 'video'
  if (!file) throw new Error("Archivo requerido.");

  const ext = file.name.split(".").pop() || "bin";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: upErr } = await supa.storage.from("hall").upload(path, file, {
    upsert: false,
  });
  if (upErr) throw upErr;

  const { data: pub } = supa.storage.from("hall").getPublicUrl(path);
  const storage_path = path;
  const media_url = pub.publicUrl;

  const { error: insErr } = await supa.from("hall_media").insert({
    hall_slug: slug,
    author_id: user.id,
    author_name,
    media_type: type,
    storage_path,
    media_url,
  });
  if (insErr) throw insErr;

  revalidatePath(`/hall/${slug}`);
}

/** Agregar media por URL de YouTube */
export async function addYoutubeAction(slug: string, youtubeUrl: string) {
  const { supa, user, author_name } = await getSessionUser();
  if (!youtubeUrl) throw new Error("YouTube URL requerida.");

  const { error } = await supa.from("hall_media").insert({
    hall_slug: slug,
    author_id: user.id,
    author_name,
    media_type: "youtube",
    media_url: youtubeUrl,
  });
  if (error) throw error;

  revalidatePath(`/hall/${slug}`);
}

/** Comentar en el Hall */
export async function addHallComment(slug: string, fd: FormData) {
  const { supa, user, author_name } = await getSessionUser();
  const text = String(fd.get("text") || "").trim();
  if (!text) throw new Error("El comentario no puede estar vacío.");

  const { error } = await supa.from("hall_comments").insert({
    hall_slug: slug,
    author_id: user.id,
    author_name,
    text,
  });
  if (error) throw error;

  revalidatePath(`/hall/${slug}`);
}

/** Votar al Hall (opcionalmente por media_id específico) */
export async function toggleVote(a: string, b?: string) {
  const slug = a;
  const media_id = b ?? null;

  const { supa, user } = await getSessionUser();

  const { data: existing, error: selErr } = await supa
    .from("hall_votes")
    .select("id")
    .eq("hall_slug", slug)
    .eq("author_id", user.id)
    .eq("media_id", media_id)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    const { error: delErr } = await supa
      .from("hall_votes")
      .delete()
      .eq("id", existing.id);
    if (delErr) throw delErr;
  } else {
    const { error: insErr } = await supa.from("hall_votes").insert({
      hall_slug: slug,
      author_id: user.id,
      media_id,
    });
    if (insErr) throw insErr;
  }

  const { count } = await supa
    .from("hall_votes")
    .select("*", { count: "exact", head: true })
    .eq("hall_slug", slug)
    .eq("media_id", media_id);

  revalidatePath(`/hall/${slug}`);
  return { ok: true, votes: count ?? 0 };
}
