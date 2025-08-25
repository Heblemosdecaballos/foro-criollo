"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

type Ok<T = unknown> = { ok: true } & T;
type Fail = { ok: false; error: string };

async function getSessionUser(): Promise<
  Ok<{ supa: ReturnType<typeof createSupabaseServerClient>; user: any; author_name: string }> | Fail
> {
  try {
    const supa = createSupabaseServerClient();
    const { data, error } = await supa.auth.getUser();
    if (error) return { ok: false, error: error.message };
    if (!data?.user) return { ok: false, error: "Debes iniciar sesión." };

    const user = data.user;
    const author_name =
      (user.user_metadata &&
        (user.user_metadata.full_name || user.user_metadata.name)) ||
      user.email ||
      "Usuario";

    return { ok: true, supa, user, author_name };
  } catch (e: any) {
    console.error("[getSessionUser] ", e);
    return { ok: false, error: e?.message || "Error al obtener sesión." };
  }
}

/** Subir archivo (imagen/video) al bucket 'hall' */
export async function addMediaAction(
  slug: string,
  fd: FormData
): Promise<Ok | Fail> {
  const sess = await getSessionUser();
  if (!sess.ok) return sess;
  const { supa, user, author_name } = sess;

  try {
    const type = (fd.get("type") as string) || "image"; // 'image' | 'video'
    const file = fd.get("file") as File | null;
    if (!file) return { ok: false, error: "Archivo requerido." };

    const ext = file.name.split(".").pop() || "bin";
    const storage_path = `${user.id}/${Date.now()}.${ext}`;

    const { error: upErr } = await supa.storage.from("hall").upload(storage_path, file, {
      upsert: false,
    });
    if (upErr) return { ok: false, error: upErr.message };

    const { data: pub } = supa.storage.from("hall").getPublicUrl(storage_path);
    const media_url = pub.publicUrl;

    const { error: insErr } = await supa.from("hall_media").insert({
      hall_slug: slug,
      author_id: user.id,
      author_name,
      media_type: type,
      storage_path,
      media_url,
    });
    if (insErr) return { ok: false, error: insErr.message };

    revalidatePath(`/hall/${slug}`);
    return { ok: true };
  } catch (e: any) {
    console.error("[addMediaAction] ", e);
    return { ok: false, error: e?.message || "No se pudo subir el archivo." };
  }
}

/** Agregar media por URL de YouTube */
export async function addYoutubeAction(
  slug: string,
  youtubeUrl: string
): Promise<Ok | Fail> {
  const sess = await getSessionUser();
  if (!sess.ok) return sess;
  const { supa, user, author_name } = sess;

  try {
    const url = (youtubeUrl || "").trim();
    if (!url) return { ok: false, error: "YouTube URL requerida." };

    const { error } = await supa.from("hall_media").insert({
      hall_slug: slug,
      author_id: user.id,
      author_name,
      media_type: "youtube",
      media_url: url,
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/hall/${slug}`);
    return { ok: true };
  } catch (e: any) {
    console.error("[addYoutubeAction] ", e);
    return { ok: false, error: e?.message || "No se pudo agregar YouTube." };
  }
}

/** Comentar en el Hall */
export async function addHallComment(
  slug: string,
  fd: FormData
): Promise<Ok | Fail> {
  const sess = await getSessionUser();
  if (!sess.ok) return sess;
  const { supa, user, author_name } = sess;

  try {
    const text = String(fd.get("text") || "").trim();
    if (!text) return { ok: false, error: "El comentario no puede estar vacío." };

    const { error } = await supa.from("hall_comments").insert({
      hall_slug: slug,
      author_id: user.id,
      author_name,
      text,
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/hall/${slug}`);
    return { ok: true };
  } catch (e: any) {
    console.error("[addHallComment] ", e);
    return { ok: false, error: e?.message || "No se pudo comentar." };
  }
}

/** Votar al Hall (opcionalmente por media_id) */
export async function toggleVote(a: string, b?: string): Promise<Ok<{ votes: number }> | Fail> {
  const slug = a;
  const media_id = b ?? null;
  const sess = await getSessionUser();
  if (!sess.ok) return sess;
  const { supa, user } = sess;

  try {
    const { data: existing, error: selErr } = await supa
      .from("hall_votes")
      .select("id")
      .eq("hall_slug", slug)
      .eq("author_id", user.id)
      .eq("media_id", media_id)
      .maybeSingle();
    if (selErr) return { ok: false, error: selErr.message };

    if (existing) {
      const { error: delErr } = await supa
        .from("hall_votes")
        .delete()
        .eq("id", existing.id);
      if (delErr) return { ok: false, error: delErr.message };
    } else {
      const { error: insErr } = await supa.from("hall_votes").insert({
        hall_slug: slug,
        author_id: user.id,
        media_id,
      });
      if (insErr) return { ok: false, error: insErr.message };
    }

    const { count, error: cntErr } = await supa
      .from("hall_votes")
      .select("*", { count: "exact", head: true })
      .eq("hall_slug", slug)
      .eq("media_id", media_id);
    if (cntErr) return { ok: false, error: cntErr.message };

    revalidatePath(`/hall/${slug}`);
    return { ok: true, votes: count ?? 0 };
  } catch (e: any) {
    console.error("[toggleVote] ", e);
    return { ok: false, error: e?.message || "No se pudo votar." };
  }
}
