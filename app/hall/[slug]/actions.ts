// /app/hall/[slug]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import path from "node:path";
import { createSupabaseServerClient as createSupabase } from "@/utils/supabase/server";

async function requireAdmin(supabase: ReturnType<typeof createSupabase>) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("No autenticado");
  const { data: prof, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!prof?.is_admin) throw new Error("Acceso denegado");
}

async function getEntryId(supabase: ReturnType<typeof createSupabase>, slug: string) {
  const { data, error } = await supabase
    .from("hall_entries")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("No existe el Hall con ese slug");
  return data.id as string;
}

const YT_ID_RE =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)?([A-Za-z0-9_-]{6,})/i;

/** --- Acción genérica que tu AddMediaForm podría usar --- */
export async function addMediaAction(formData: FormData) {
  const supabase = createSupabase();
  await requireAdmin(supabase);

  const slug = String(formData.get("slug") || "");
  const caption = (formData.get("caption") as string) || null;
  const credit = (formData.get("credit") as string) || null;

  if (!slug) return { ok: false, error: "slug requerido" };

  const entryId = await getEntryId(supabase, slug);

  // ¿Imagen o YouTube?
  const file = formData.get("file") as File | null;
  const youtube = (formData.get("youtube") as string) || "";

  try {
    if (file && file.size > 0) {
      // Imagen
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
      if (!allowed.includes(file.type)) return { ok: false, error: "Formato no permitido" };
      if (file.size > 8 * 1024 * 1024) return { ok: false, error: "Máx 8MB" };

      const ext = file.name.split(".").pop() || "jpg";
      const base = path.parse(file.name).name.replace(/[^\w\-]+/g, "_").slice(0, 48);
      const filename = `${base}_${randomUUID().slice(0, 8)}.${ext}`;
      const storagePath = `${slug}/${filename}`;

      const { error: upErr } = await supabase.storage
        .from("hall")
        .upload(storagePath, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("hall_media").insert({
        entry_id: entryId,
        storage_path: `hall/${storagePath}`,
        kind: "image",
        caption,
        credit,
      });
      if (insErr) throw insErr;
    } else if (youtube) {
      // YouTube
      const match = youtube.match(YT_ID_RE);
      const ytId = (match ? match[1] : youtube).trim();
      if (!/^[A-Za-z0-9_-]{6,}$/.test(ytId)) return { ok: false, error: "YouTube ID/URL inválido" };

      const { error: insErr } = await supabase.from("hall_media").insert({
        entry_id: entryId,
        storage_path: `youtube:${ytId}`,
        kind: "youtube",
        caption,
        credit,
      });
      if (insErr) throw insErr;
    } else {
      return { ok: false, error: "Adjunta una imagen o una URL/ID de YouTube" };
    }

    revalidatePath(`/hall/${slug}`);
    revalidatePath(`/admin/hall/${slug}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Error guardando media" };
  }
}

/** --- Exports que tus formularios están esperando explícitamente --- */
export async function addYoutubeAction(formData: FormData) {
  // simple wrapper para compatibilidad con AddVideoForm
  return addMediaAction(formData);
}

export async function uploadImageAction(formData: FormData) {
  // simple wrapper para compatibilidad con AddImageForm
  return addMediaAction(formData);
}
