// src/app/foro/nuevo/server-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { ForumCategory } from "@/constants/forums";

export async function createForum(fd: FormData) {
  const title = String(fd.get("title") || "").trim();
  const category = String(fd.get("category") || "");
  const content = String(fd.get("content") || "");

  if (!title || !category) return;

  const supa = createSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error("auth");

  const { error } = await supa.from("threads").insert({
    title,
    content,
    category: category as ForumCategory,
    author_id: user.id,
  });

  if (error) throw error;

  revalidatePath("/foro");
}
