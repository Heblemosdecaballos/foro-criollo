"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function createStory(fd: FormData) {
  const title = String(fd.get("title") || "").trim();
  const content = String(fd.get("content") || "").trim();
  const mode = String(fd.get("coverMode") || "upload");

  if (!title || !content) return;

  const supa = createSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) throw new Error("auth");

  let cover_path: string | null = null;

  if (mode === "upload") {
    const file = fd.get("coverFile") as File | null;
    if (file && file.size > 0) {
      const path = `stories/${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supa.storage
        .from("stories")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supa.storage.from("stories").getPublicUrl(path);
      cover_path = data.publicUrl;
    }
  } else {
    const url = String(fd.get("coverUrl") || "").trim();
    if (url) cover_path = url;
  }

  const { error } = await supa
    .from("stories")
    .insert({ title, content, cover_path, author_id: user.id });
  if (error) throw error;

  revalidatePath("/historias");
  revalidatePath("/");
}
