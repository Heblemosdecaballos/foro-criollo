// /app/foro/nuevo/actions.ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";

/** Cliente Supabase (server) */
function supa() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  );
}

/**
 * Crea un nuevo foro/hilo.
 * Espera campos: title, body
 */
export async function createThreadAction(fd: FormData) {
  try {
    const s = supa();

    const { data: auth } = await s.auth.getUser();
    if (!auth?.user) throw new Error("Debes iniciar sesión.");

    const title = (fd.get("title") as string)?.trim();
    const body = ((fd.get("body") as string) || "").trim();

    if (!title || title.length < 3) throw new Error("Título demasiado corto.");

    const { data, error } = await s
      .from("forum_threads")
      .insert({
        title,
        body,
        author_id: auth.user.id,
      })
      .select("id")
      .maybeSingle();

    if (error) throw error;

    revalidatePath("/foro");
    return { ok: true, id: data?.id ?? null };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "No se pudo crear el foro." };
  }
}
