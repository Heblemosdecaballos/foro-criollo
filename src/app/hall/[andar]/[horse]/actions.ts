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

  if (insErr) {
    return { ok: false, message: `Subió pero falló registrar media: ${insErr.message}` };
  }

  revalidatePath(`/hall/${andarSlug}/${horseSlug}`);
  return { ok: true, message: "Imagen subida correctamente.", mediaId: inserted?.id, public_url };
}

// (alias opcional si en algún sitio lo importaste con el nombre viejo)
export { uploadMediaAction as uploadHorseMediaAction };

// ==============================
//  MARCAR PORTADA
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
