// /app/hall/[slug]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import path from "node:path";
import { supabaseServer } from "@/lib/supabase/server";

const createSupabase = supabaseServer;

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
async function requireUser(supabase: ReturnType<typeof createSupabase>) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Debes iniciar sesión");
  return auth.user;
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

export async function addMediaAction(formData: FormData): Promise<void> {
  const supabase = createSupabase();
  await requireAdmin(supabase);

  const slug = String(formData.get("slug") || "");
  const caption = (formData.get("caption") as string) || null;
  const credit = (formData.get("credit") as string) || null;
  if (!slug) throw new Error("slug requerido");

  const entryId = await getEntryId(supabase, slug);

  const file = formData.get("file") as File | null;
  const youtube = (formData.get("youtube") as string) || "";

  if (file && file.size > 0) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) throw new Error("Formato no permitido");
    if (file.size > 8 * 1024 * 1024) throw new Error("Máx 8MB");

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
    const match = youtube.match(YT_ID_RE);
    const ytId = (match ? match[1] : youtube).trim();
    if (!/^[A-Za-z0-9_-]{6,}$/.test(ytId)) throw new Error("YouTube ID/URL inválido");

    const { error: insErr } = await supabase.from("hall_media").insert({
      entry_id: entryId,
      storage_path: `youtube:${ytId}`,
      kind: "youtube",
      caption,
      credit,
    });
    if (insErr) throw insErr;
  } else {
    throw new Error("Adjunta una imagen o una URL/ID de YouTube");
  }

  revalidatePath(`/hall/${slug}`);
  revalidatePath(`/admin/hall/${slug}`);
}

export async function addYoutubeAction(fd: FormData): Promise<void> {
  await addMediaAction(fd);
}
export async function uploadImageAction(fd: FormData): Promise<void> {
  await addMediaAction(fd);
}

export async function addHallComment(formData: FormData): Promise<void> {
  const supabase = createSupabase();
  const user = await requireUser(supabase);

  const slug = String(formData.get("slug") || "");
  const body =
    (formData.get("comment") as string) ||
    (formData.get("body") as string) ||
    (formData.get("content") as string) ||
    "";

  if (!slug) throw new Error("slug requerido");
  if (!body || body.trim().length < 2) throw new Error("Escribe un comentario");

  const entryId = await getEntryId(supabase, slug);

  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("hall_comments").insert({
    entry_id: entryId,
    body: body.trim(),
    author_id: user.id,
    author_name: prof?.full_name ?? null,
  });
  if (error) throw error;

  revalidatePath(`/hall/${slug}`);
}

export async function toggleVote(
  profileId: string,
  slug: string
): Promise<{ ok: boolean; votes: number }> {
  const supabase = createSupabase();
  const user = await requireUser(supabase);
  if (profileId && profileId !== user.id) throw new Error("Sesión no coincide con el perfil");

  const entryId = await getEntryId(supabase, slug);

  const { data: existing, error: selErr } = await supabase
    .from("hall_votes")
    .select("entry_id")
    .eq("entry_id", entryId)
    .eq("voter_id", user.id)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    const { error: delErr } = await supabase
      .from("hall_votes")
      .delete()
      .eq("entry_id", entryId)
      .eq("voter_id", user.id);
    if (delErr) throw delErr;
  } else {
    const { error: insErr } = await supabase.from("hall_votes").insert({
      entry_id: entryId,
      voter_id: user.id,
    });
    if (insErr) throw insErr;
  }

  const { count, error: cntErr } = await supabase
    .from("hall_votes")
    .select("*", { count: "exact", head: true })
    .eq("entry_id", entryId);
  if (cntErr) throw cntErr;

  revalidatePath(`/hall/${slug}`);
  return { ok: true, votes: count ?? 0 };
}
