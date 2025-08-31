"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

// --- util: extensión desde MIME
function extFromMime(mime: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return map[mime] || "bin";
}

// ==============================
//  SUBIR MEDIA
// ==============================
export async function uploadMediaAction(formData: FormData) {
  const horseId = String(formData.get("horseId") || "");
  const andarSlug = String(formData.get("andarSlug") || "");
  const horseSlug = String(formData.get("horseSlug") || "");
  const file = formData.get("file") as File | null;

  if (!horseId || !andarSlug || !horseSlug) {
    return { ok: false, message: "Faltan parámetros (horseId/andarSlug/horseSlug)." };
  }
  if (!file) return { ok: false, message: "No se recibió archivo." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, message: "El archivo supera 10 MB." };

  const supabase = createSupabaseServer();

  // Sesión
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user;
  if (userErr || !user) return { ok: false, message: "Debes iniciar sesión para subir media." };

  // Validar caballo
  const { data: horse, error: horseErr } = await supabase
    .from("horses")
    .select("id")
    .eq("id", horseId)
    .single();
  if (horseErr || !horse) return { ok: false, message: "El ejemplar no existe." };

  const mime = file.type || "application/octet-stream";
  const ext = extFromMime(mime);
  const uuid =
    (globalThis.crypto?.randomUUID?.() as string) ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const storagePath = `horses/${horseId}/${uuid}.${ext}`;

  // Subir al bucket público
  const { error: upErrPub } = await supabase.storage
    .from("hall-public")
    .upload(storagePath, file, { cacheControl: "3600", upsert: false, contentType: mime });
  if (upErrPub) return { ok: false, message: `Error subiendo (público): ${upErrPub.message}` };

  // URL pública
  const { data: pub } = supabase.storage.from("hall-public").getPublicUrl(storagePath);
  const public_url = pub.publicUrl;

  // Registrar en DB
  const { error: insErr, data: inserted } = await supabase
    .from("horse_media")
    .insert({
      horse_id: horseId,
      storage_path: storagePath,
      public_url,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (insErr) return { ok: false, message: `Subió pero falló registrar media: ${insErr.message}` };

  revalidatePath(`/hall/${andarSlug}/${horseSlug}`);
  return { ok: true, message: "Imagen subida correctamente.", mediaId: inserted?.id, public_url };
}

// alias por si algún componente usa el nombre anterior
export { uploadMediaAction as uploadHorseMediaAction };

// ==============================
//  MARCAR PORTADA (setFeatured)
// ==============================
export async function setCoverAction(payload: {
  horseId: string;
  mediaId: string;
  andarSlug: string;
  horseSlug: string;
}) {
  const { horseId, mediaId, andarSlug, horseSlug } = payload;
  if (!horseId || !mediaId) return { ok: false, message: "Faltan parámetros." };

  const supabase = createSupabaseServer();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user;
  if (userErr || !user) return { ok: false, message: "Debes iniciar sesión." };

  // Confirmar pertenencia
  const { data: media, error: mErr } = await supabase
    .from("horse_media")
    .select("id, horse_id")
    .eq("id", mediaId)
    .single();
  if (mErr || !media || media.horse_id !== horseId) {
    return { ok: false, message: "La media no pertenece a este ejemplar." };
  }

  // Limpiar portada anterior
  const { error: clearErr } = await supabase
    .from("horse_media")
    .update({ is_cover: false })
    .eq("horse_id", horseId)
    .eq("is_cover", true);
  if (clearErr) return { ok: false, message: `No se pudo limpiar portada previa: ${clearErr.message}` };

  // Marcar nueva
  const { error: coverErr } = await supabase
    .from("horse_media")
    .update({ is_cover: true })
    .eq("id", mediaId);
  if (coverErr) return { ok: false, message: `No se pudo marcar portada: ${coverErr.message}` };

  revalidatePath(`/hall/${andarSlug}/${horseSlug}`);
  return { ok: true, message: "Portada actualizada." };
}

// alias para compatibilidad con "setFeaturedMediaAction"
export { setCoverAction as setFeaturedMediaAction };

// ==============================
//  BORRAR MEDIA
// ==============================
export async function deleteMediaAction(payload: {
  mediaId: string;
  horseId: string;
  andarSlug: string;
  horseSlug: string;
}) {
  const { mediaId, horseId, andarSlug, horseSlug } = payload;

  const supabase = createSupabaseServer();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user;
  if (userErr || !user) return { ok: false, message: "Debes iniciar sesión." };

  // Traer registro para conocer storage_path
  const { data: row, error: getErr } = await supabase
    .from("horse_media")
    .select("id, horse_id, storage_path")
    .eq("id", mediaId)
    .single();
  if (getErr || !row || row.horse_id !== horseId) {
    return { ok: false, message: "Media no encontrada o no pertenece al ejemplar." };
  }

  // Borrar archivo del bucket público
  const { error: remErr } = await supabase.storage
    .from("hall-public")
    .remove([row.storage_path]);
  if (remErr) {
    // seguimos, pero informamos
    console.warn("No se pudo borrar del storage:", remErr.message);
  }

  // Borrar registro
  const { error: delErr } = await supabase.from("horse_media").delete().eq("id", mediaId);
  if (delErr) return { ok: false, message: `No se pudo borrar media: ${delErr.message}` };

  revalidatePath(`/hall/${andarSlug}/${horseSlug}`);
  return { ok: true, message: "Media eliminada." };
}

// ==============================
//  VOTAR (like/dislike)
// ==============================
export async function voteAction(payload: { horseId: string; value: 1 | -1 }) {
  const { horseId, value } = payload;
  if (value !== 1 && value !== -1) return { ok: false, message: "Valor de voto inválido." };

  const supabase = createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { ok: false, message: "Debes iniciar sesión." };

  // upsert en hall_votes (requiere índice único en (horse_id, created_by))
  const { error } = await supabase
    .from("hall_votes")
    .upsert(
      { horse_id: horseId, value, created_by: user.id },
      { onConflict: "horse_id,created_by" }
    );
  if (error) return { ok: false, message: error.message };

  return { ok: true };
}

// ==============================
//  COMENTAR
// ==============================
export async function commentAction(payload: { horseId: string; text: string }) {
  const { horseId, text } = payload;
  if (!text?.trim()) return { ok: false, message: "Comentario vacío." };

  const supabase = createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { ok: false, message: "Debes iniciar sesión." };

  const { error } = await supabase
    .from("hall_comments")
    .insert({ horse_id: horseId, content: text.trim(), created_by: user.id });
  if (error) return { ok: false, message: error.message };

  return { ok: true };
}

// ==============================
//  FOLLOW / UNFOLLOW (stubs)
// ==============================
// Si aún no tienes la tabla (p. ej. horse_follows), dejamos stubs seguros
export async function followAction(_payload: { horseId: string }) {
  return { ok: false, message: "Seguir ejemplar aún no está habilitado." };
}
export async function unfollowAction(_payload: { horseId: string }) {
  return { ok: false, message: "Dejar de seguir aún no está habilitado." };
}
