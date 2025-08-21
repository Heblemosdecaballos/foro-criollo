// /src/app/admin/hall/[slug]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import path from "node:path";
import { supabaseServer } from "@/lib/supabase/server";

// Alias local para no tocar el resto del código
const createSupabaseServer = supabaseServer;

/* ===== Helpers ===== */
async function assertAdmin(supabase: ReturnType<typeof createSupabaseServer>) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("No autenticado.");

  const { data: prof, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!prof?.is_admin) throw new Error("Acceso denegado: requiere admin.");
}

async function getEntryIdBySlug(
  supabase: ReturnType<typeof createSupabaseServer>,
  slug: string
) {
  const { data, error } = await supabase
    .from("hall_entries")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("No existe un Hall con ese slug.");
  return data.id as string;
}

const YT_ID_RE =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)?([A-Za-z0-9_-]{6,})/i;

/* ===== Acción: Agregar YouTube ===== */
export async function addYouTubeAction(formData: FormData) {
  const supabase = createSupabaseServer();

  const slug = String(formData.get("slug") || "");
  const youtubeUrlOrId = String(formData.get("youtube") || "");
  const caption = ((formData.get("caption") as string) || "").trim() || null;
  const credit = ((formData.get("credit") as string) || "").trim() || null;

  if (!slug) return { ok: false, error: "slug requerido." };
  if (!youtubeUrlOrId) return { ok: false, error: "URL o ID de YouTube requerido." };

  try {
    await assertAdmin(supabase);

    const entryId = await getEntryIdBySlug(supabase, slug);

    const match = youtubeUrlOrId.match(YT_ID_RE);
    const ytId = (match ? match[1] : youtubeUrlOrId).trim();
    if (!/^[A-Za-z0-9_-]{6,}$/.test(ytId)) {
      return { ok: false, error: "YouTube ID inválido." };
    }

    const { error: insErr } = await supabase.from("hall_media").insert({
      entry_id: entryId,
      storage_path: `youtube:${ytId}`,
      kind: "youtube",
      caption,
      credit,
    });
    if (insErr) throw insErr;

    revalidatePath(`/hall/${slug}`);
    revalidatePath(`/admin/hall/${slug}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Error agregando video." };
  }
}

/* ===== Acción: Subir imagen ===== */
export async function uploadImageAction(formData: FormData) {
  const supabase = createSupabaseServer();

  const slug = String(formData.get("slug") || "");
  const caption = ((formData.get("caption") as string) || "").trim() || null;
  const credit = ((formData.get("credit") as string) || "").trim() || null;

  const file = formData.get("file") as File | null;
  if (!slug) return { ok: false, error: "slug requerido." };
  if (!file) return { ok: false, error: "Archivo requerido." };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowed.includes(file.type)) {
    return { ok: false, error: "Formato no permitido. Usa JPG/PNG/WebP/AVIF." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "Máximo 8MB por imagen." };
  }

  try {
    await assertAdmin(supabase);

    const entryId = await getEntryIdBySlug(supabase, slug);

    const ext = file.name.split(".").pop() || "jpg";
    const base = path.parse(file.name).name.replace(/[^\w\-]+/g, "_").slice(0, 48);
    const filename = `${base}_${randomUUID().slice(0, 8)}.${ext}`;
    const storagePath = `${slug}/${filename}`; // dentro del bucket 'hall'

    const { error: upErr } = await supabase.storage
      .from("hall")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (upErr) throw upErr;

    const { error: insErr } = await supabase.from("hall_media").insert({
      entry_id: entryId,
      storage_path: `hall/${storagePath}`,
      kind: "image",
      caption,
      credit,
    });
    if (insErr) throw insErr;

    revalidatePath(`/hall/${slug}`);
    revalidatePath(`/admin/hall/${slug}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Error subiendo imagen." };
  }
}
