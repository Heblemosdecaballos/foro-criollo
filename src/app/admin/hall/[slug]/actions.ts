// /src/app/admin/hall/[slug]/actions.ts
"use server";

export const runtime = "nodejs";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { randomUUID } from "crypto";
import path from "node:path";

/** Cliente Supabase local (evita imports frágiles) */
function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (name: string) => cookieStore.get(name)?.value },
    }
  );
}

/* ===== Helpers ===== */
async function assertAdmin() {
  const supabase = createSupabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("No autenticado.");

  const { data: prof, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!prof?.is_admin) throw new Error("Acceso denegado: requiere admin.");
}

async function getEntryIdBySlug(slug: string) {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("hall_entries")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) throw new Error("No existe un Hall con ese slug.");
  return data.id as string;
}

const YT_ID_RE =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)?([A-Za-z0-9_-]{6,})/i;

/* ===== Acción: Agregar YouTube ===== */
export async function addYouTubeAction(formData: FormData) {
  try {
    await assertAdmin();
    const supabase = createSupabaseServer();

    const slug = String(formData.get("slug") || "");
    const youtubeUrlOrId = String(formData.get("youtube") || "");
    const caption = ((formData.get("caption") as string) || "").trim() || null;
    const credit = ((formData.get("credit") as string) || "").trim() || null;

    if (!slug) throw new Error("slug requerido.");
    if (!youtubeUrlOrId) throw new Error("URL o ID de YouTube requerido.");

    const entryId = await getEntryIdBySlug(slug);
    const match = youtubeUrlOrId.match(YT_ID_RE);
    const ytId = (match ? match[1] : youtubeUrlOrId).trim();
    if (!/^[A-Za-z0-9_-]{6,}$/.test(ytId)) throw new Error("YouTube ID inválido.");

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
    return { ok: false, error: e?.message ?? "Error agregando video." };
  }
}

/* ===== Acción: Subir imagen ===== */
export async function uploadImageAction(formData: FormData) {
  try {
    await assertAdmin();
    const supabase = createSupabaseServer();

    const slug = String(formData.get("slug") || "");
    const caption = ((formData.get("caption") as string) || "").trim() || null;
    const credit = ((formData.get("credit") as string) || "").trim() || null;

    if (!slug) throw new Error("slug requerido.");

    const file = formData.get("file") as File | null;
    if (!file) throw new Error("Archivo requerido.");

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) throw new Error("Formato no permitido (JPG/PNG/WebP/AVIF).");
    if (file.size > 8 * 1024 * 1024) throw new Error("Máximo 8MB.");

    const entryId = await getEntryIdBySlug(slug);

    const ext = file.name.split(".").pop() || "jpg";
    const base = path.parse(file.name).name.replace(/[^\w\-]+/g, "_").slice(0, 48);
    const filename = `${base}_${randomUUID().slice(0, 8)}.${ext}`;
    const storagePath = `${slug}/${filename}`; // dentro del bucket 'hall'

    // Subir a Storage
    const { error: upErr } = await supabase.storage
      .from("hall")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (upErr) throw upErr;

    // Registrar en DB
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
    return { ok: false, error: e?.message ?? "Error subiendo imagen." };
  }
}
