"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isAdminEmail, storagePaths } from "@/lib/hall/utils";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const MOD_EMAIL = process.env.FORUM_MOD_EMAIL;

export async function uploadMediaAction(fd: FormData) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return { ok: false, message: "Solo admin." };
  }

  // ✅ Capturamos el user.id para evitar el error de TS en closures
  const createdBy = user.id;

  const horse_id = String(fd.get("horse_id") || "");
  const andar = String(fd.get("andar") || "");
  const horse_slug = String(fd.get("horse_slug") || "");

  const paths = storagePaths(andar as any, horse_slug);

  async function handleFile(
    kind: "Images" | "Videos" | "Docs",
    file: File,
    type: "image" | "video" | "doc"
  ) {
    if (file.size > 10 * 1024 * 1024) throw new Error("Archivo mayor a 10MB");

    const originalPath = `Hall/${andar}/${horse_slug}/${kind}/${file.name}`;

    // 1) Subir al bucket PRIVADO (originales)
    const { error: upErr } = await supabase.storage
      .from("hall-originals")
      .upload(originalPath, file, { upsert: true, contentType: file.type });
    if (upErr) throw upErr;

    // 2) Copiar al bucket PÚBLICO para visualización (mirror simple)
    const { data: signed } = await supabase.storage
      .from("hall-originals")
      .createSignedUrl(originalPath, 60); // URL temporal para leer el binario
    if (!signed?.signedUrl) throw new Error("No se pudo firmar URL");

    const r = await fetch(signed.signedUrl);
    const blob = await r.blob();

    const { error: pubErr } = await supabase.storage
      .from("hall-public")
      .upload(originalPath, blob, { upsert: true, contentType: file.type });
    if (pubErr) throw pubErr;

    // 3) Registrar en DB (apuntamos al bucket público para listar/mostrar)
    const { error: dbErr } = await supabase.from("hall_media").insert({
      horse_id,
      type,
      bucket: "hall-public",
      path: originalPath,
      mime_type: file.type,
      size_bytes: file.size,
      created_by: createdBy, // ✅ usamos la constante segura
    });
    if (dbErr) throw dbErr;
  }

  try {
    const imgs = fd.getAll("images") as File[];
    const vids = fd.getAll("videos") as File[];
    const docs = fd.getAll("docs") as File[];

    for (const f of imgs) await handleFile("Images", f, "image");
    for (const f of vids) await handleFile("Videos", f, "video");
    for (const f of docs) await handleFile("Docs", f, "doc");

    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Error al subir" };
  }
}

export async function voteAction(horseId: string) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  // Upsert voto
  const { error } = await supabase
    .from("hall_votes")
    .upsert({ horse_id: horseId, user_id: user.id, value: 1 });
  if (error) return { ok: false, message: error.message };

  // Recalcular conteo (uso de count correcto)
  const { count, error: countErr } = await supabase
    .from("hall_votes")
    .select("*", { count: "exact", head: true })
    .eq("horse_id", horseId);
  if (countErr) return { ok: false, message: countErr.message };

  if (typeof count === "number") {
    await supabase.from("horses").update({ votes_count: count }).eq("id", horseId);
  }

  return { ok: true, votes_count: count ?? undefined };
}

export async function followAction(horseId: string) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { ok: false, message: "Inicia sesión." };

  const { error } = await supabase
    .from("hall_follows")
    .upsert({ horse_id: horseId, user_id: user.id, user_email: user.email });
  if (error) return { ok: false, message: error.message };

  return { ok: true };
}

export async function unfollowAction(horseId: string) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  const { error } = await supabase
    .from("hall_follows")
    .delete()
    .eq("horse_id", horseId)
    .eq("user_id", user.id);
  if (error) return { ok: false, message: error.message };

  return { ok: true };
}

export async function commentAction(
  targetType: "horse" | "media",
  targetId: string,
  content: string
) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  const { error } = await supabase
    .from("hall_comments")
    .insert({ target_type: targetType, target_id: targetId, user_id: user.id, content });
  if (error) return { ok: false, message: error.message };

  // Notificar followers si el comentario es sobre MEDIA
  if (targetType === "media" && resend) {
    const { data: media } = await supabase
      .from("hall_media")
      .select("horse_id")
      .eq("id", targetId)
      .single();

    if (media?.horse_id) {
      const { data: subs } = await supabase
        .from("hall_follows")
        .select("user_email")
        .eq("horse_id", media.horse_id);

      const to = (subs || []).map((s) => s.user_email).filter(Boolean) as string[];
      if (to.length && process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: "Hablando de Caballos <onboarding@resend.dev>",
          to,
          subject: "Nuevo comentario en media del ejemplar que sigues",
          text: "Hay un nuevo comentario en una foto/video. Entra a verlo.",
        });
      }
    }
  }

  return { ok: true };
}

export async function reportAction(
  targetType: "horse" | "media",
  targetId: string,
  reason?: string
) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  const { error } = await supabase
    .from("hall_reports")
    .insert({ target_type: targetType, target_id: targetId, reason: reason || null, created_by: user.id });
  if (error) return { ok: false, message: error.message };

  if (MOD_EMAIL && resend) {
    await resend.emails.send({
      from: "Hablando de Caballos <onboarding@resend.dev>",
      to: [MOD_EMAIL],
      subject: `[Hall] Reporte sobre ${targetType}`,
      text: `Se reportó ${targetType} ${targetId}. Motivo: ${reason || "(sin motivo)"}`,
    });
  }

  return { ok: true };
}
