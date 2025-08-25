"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * Subir media a un Hall.
 * Uso: addMediaAction(slug, formData)
 */
export async function addMediaAction(slug: string, fd: FormData) {
  const supa = createSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const file = fd.get("file") as File | null;
  const type = fd.get("type") as string;
  const media_url = fd.get("url") as string | null;

  let storage_path: string | null = null;

  if (file) {
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { data, error } = await supa.storage
      .from("hall")
      .upload(path, file);

    if (error) throw error;

    const { data: publicUrl } = supa.storage
      .from("hall")
      .getPublicUrl(path);

    storage_path = publicUrl.publicUrl;
  }

  const { error: insErr } = await supa.from("hall_media").insert({
    hall_slug: slug,
    author_id: user.id,
    media_type: type,
    storage_path,
    media_url,
  });

  if (insErr) throw insErr;

  revalidatePath(`/hall/${slug}`);
}

/**
 * Comentar en un Hall.
 * Uso: addHallComment(slug, formData)
 */
export async function addHallComment(slug: string, fd: FormData) {
  const supa = createSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const text = fd.get("text") as string;

  const { error: insErr } = await supa.from("hall_comments").insert({
    hall_slug: slug,
    author_id: user.id,
    text,
  });

  if (insErr) throw insErr;

  revalidatePath(`/hall/${slug}`);
}

/**
 * Agregar video de YouTube (shim temporal).
 * Uso: addYoutubeAction(slug, youtubeUrl)
 */
export async function addYoutubeAction(slug: string, youtubeUrl: string) {
  const supa = createSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error: insErr } = await supa.from("hall_media").insert({
    hall_slug: slug,
    author_id: user.id,
    media_type: "youtube",
    media_url: youtubeUrl,
  });

  if (insErr) throw insErr;

  revalidatePath(`/hall/${slug}`);
}

/**
 * Votar en un Hall.
 * Uso: toggleVote(slug) o toggleVote(slug, media_id)
 */
export async function toggleVote(a: string, b?: string) {
  const supa = createSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const hall_slug = a;
  const media_id = b ?? null;

  const { data: existing, error: selErr } = await supa
    .from("hall_votes")
    .select("*")
    .eq("hall_slug", hall_slug)
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
      hall_slug,
      author_id: user.id,
      media_id,
    });

    if (insErr) throw insErr;
  }

  const { count } = await supa
    .from("hall_votes")
    .select("*", { count: "exact", head: true })
    .eq("hall_slug", hall_slug)
    .eq("media_id", media_id);

  revalidatePath(`/hall/${hall_slug}`);
  return { ok: true, votes: count ?? 0 };
}
