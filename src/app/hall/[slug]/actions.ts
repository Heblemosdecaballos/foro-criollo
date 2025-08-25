"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function addMediaAction(slug: string, fd: FormData) {
  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error("auth");

  const file = fd.get("file") as File | null;
  const type = String(fd.get("type") || "image"); // image | video | youtube
  let storage_path: string | null = null;
  let media_url: string | null = null;

  if (type === "youtube") {
    media_url = String(fd.get("youtubeUrl") || "");
  } else if (file && file.size > 0) {
    const path = `hall/${slug}/${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supa.storage.from("hall").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supa.storage.from("hall").getPublicUrl(path);
    storage_path = data.publicUrl;
  }

  const { error } = await supa.from("hall_media").insert({
    hall_slug: slug,
    author_id: user.id,
    media_type: type,
    storage_path,
    media_url,
  });
  if (error) throw error;

  revalidatePath(`/hall/${slug}`);
}

export async function addHallComment(slug: string, fd: FormData) {
  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error("auth");

  const body = String(fd.get("body") || "");
  if (!body.trim()) return;

  const { error } = await supa.from("hall_comments").insert({
    hall_slug: slug,
    author_id: user.id,
    body,
  });
  if (error) throw error;

  revalidatePath(`/hall/${slug}`);
}
