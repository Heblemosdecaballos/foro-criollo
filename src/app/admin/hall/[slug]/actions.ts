"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import path from "node:path";

// Schemas
const addYouTubeSchema = z.object({
  slug: z.string().min(1),
  youtubeUrlOrId: z.string().min(3),
  caption: z.string().max(300).optional().nullable(),
  credit: z.string().max(200).optional().nullable(),
});

const uploadImageSchema = z.object({
  slug: z.string().min(1),
  caption: z.string().max(300).optional().nullable(),
  credit: z.string().max(200).optional().nullable(),
});

const YT_ID_RE =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)?([A-Za-z0-9_-]{6,})/i;

async function getEntryIdBySlug(supabase: ReturnType<typeof createSupabaseServer>, slug: string) {
  const { data, error } = await supabase
    .from("hall_entries")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Error buscando entry por slug: ${error.message}`);
  if (!data) throw new Error("No existe un Hall entry con ese slug.");
  return data.id as string;
}

async function assertAdmin(supabase: ReturnType<typeof createSupabaseServer>) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error("No autenticado.");

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (pErr) throw new Error(`Error perfil: ${pErr.message}`);
  if (!profile?.is_admin) throw new Error("Acceso denegado: se requiere admin.");
}

export async function addYouTubeAction(formData: FormData) {
  const supabase = createSupabaseServer();

  const payload = {
    slug: String(formData.get("slug") || ""),
    youtubeUrlOrId: String(formData.get("youtube") || ""),
    caption: (formData.get("caption") as string) || null,
    credit: (formData.get("credit") as string) || null,
  };

  const parsed = addYouTubeSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  try {
    await assertAdmin(supabase);

    const { slug, youtubeUrlOrId, caption, credit } = parsed.data;
    const entryId = await getEntryIdBySlug(supabase, slug);

    const match = youtubeUrlOrId.match(YT_ID_RE);
    const ytId = match ? match[1] : youtubeUrlOrId.trim();

    if (!/^[A-Za-z0-9_-]{6,}$/.test(ytId)) {
      throw new Error("YouTube ID inválido.");
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
    return { ok: false, error: e.message || "Error agregando video." };
  }
}

export async function uploadImageAction(formData: FormData) {
  const supabase = createSupabaseServer();

  const payload = {
    slug: String(formData.get("slug") || ""),
    caption: (formData.get("caption") as string) || null,
    credit: (formData.get("credit") as string) || null,
  };

  const parsed = uploadImageSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  const file = formData.get("file") as File | null;
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

    const { slug, caption, credit } = parsed.data;
    const entryId = await getEntryIdBySlug(supabase, slug);

    // Nombre seguro
    const ext = file.name.split(".").pop() || "jpg";
    const base = path.parse(file.name).name.replace(/[^\w\-]+/g, "_").slice(0, 48);
    const filename = `${base}_${randomUUID().slice(0, 8)}.${ext}`;

    const storagePath = `${slug}/${filename}`; // dentro del bucket 'hall'

    // Subir a Storage con auth del usuario (RLS permitirá solo admin)
    const { error: upErr } = await supabase.storage
      .from("hall")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (upErr) throw upErr;

    // Guardar registro en hall_media
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
    return { ok: false, error: e.message || "Error subiendo imagen." };
  }
}
