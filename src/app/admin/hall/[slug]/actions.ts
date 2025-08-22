// /src/app/admin/hall/[slug]/actions.ts
"use server";
export const runtime = "nodejs";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { randomUUID } from "crypto";
import path from "node:path";

function supa() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  );
}

async function assertAdmin() {
  const s = supa();
  const { data: auth } = await s.auth.getUser();
  if (!auth?.user) throw new Error("No autenticado.");
  const { data: p, error } = await s.from("profiles").select("is_admin").eq("id", auth.user.id).maybeSingle();
  if (error) throw error;
  if (!p?.is_admin) throw new Error("Acceso denegado.");
}

async function getEntryId(slug: string) {
  const s = supa();
  const { data, error } = await s.from("hall_entries").select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data?.id) throw new Error("No existe el Hall.");
  return data.id as string;
}

const YT = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)?([A-Za-z0-9_-]{6,})/i;

export async function addYouTubeAction(fd: FormData) {
  try {
    await assertAdmin();
    const s = supa();

    const slug = String(fd.get("slug") || "");
    const urlOrId = String(fd.get("youtube") || "");
    const caption = ((fd.get("caption") as string) || "").trim() || null;
    const credit = ((fd.get("credit") as string) || "").trim() || null;
    if (!slug || !urlOrId) throw new Error("slug y YouTube requeridos");

    const entryId = await getEntryId(slug);
    const m = urlOrId.match(YT);
    const id = (m ? m[1] : urlOrId).trim();
    if (!/^[A-Za-z0-9_-]{6,}$/.test(id)) throw new Error("YouTube ID inválido");

    const { error } = await s.from("hall_media").insert({
      entry_id: entryId,
      storage_path: `youtube:${id}`,
      kind: "youtube",
      caption,
      credit,
    });
    if (error) throw error;

    revalidatePath(`/hall/${slug}`);
    revalidatePath(`/admin/hall/${slug}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Error agregando video" };
  }
}

export async function uploadImageAction(fd: FormData) {
  try {
    await assertAdmin();
    const s = supa();

    const slug = String(fd.get("slug") || "");
    const file = fd.get("file") as File | null;
    const caption = ((fd.get("caption") as string) || "").trim() || null;
    const credit = ((fd.get("credit") as string) || "").trim() || null;

    if (!slug || !file) throw new Error("slug y archivo requeridos");
    const okTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!okTypes.includes(file.type)) throw new Error("Formato no permitido");
    if (file.size > 8 * 1024 * 1024) throw new Error("Máximo 8MB");

    const entryId = await getEntryId(slug);
    const ext = file.name.split(".").pop() || "jpg";
    const base = path.parse(file.name).name.replace(/[^\w\-]+/g, "_").slice(0, 48);
    const filename = `${base}_${randomUUID().slice(0, 8)}.${ext}`;
    const storagePath = `${slug}/${filename}`;

    const { error: upErr } = await s.storage.from("hall").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (upErr) throw upErr;

    const { error: insErr } = await s.from("hall_media").insert({
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
    return { ok: false, error: e?.message ?? "Error subiendo imagen" };
  }
}
