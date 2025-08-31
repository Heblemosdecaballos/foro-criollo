"use server";

import { revalidatePath } from "next/cache";
// ❌ ya no usamos cookies() aquí
// import { cookies } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase/server"; // este helper en tu proyecto es de 0 argumentos

// slugify inline (sin librerías externas)
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

type Payload = {
  name: string;
  andar_slug: string;
  description?: string | null;
  pedigree_url?: string | null;
};

export async function createHorseAction(payload: Payload) {
  const { name, andar_slug, description, pedigree_url } = payload;

  if (!name || !andar_slug) {
    return { ok: false, message: "Faltan campos obligatorios." };
  }

  // ✅ tu helper no recibe args
  const supabase = createSupabaseServer();

  // Validar sesión (si tu RLS lo requiere para insert)
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false, message: "Debes iniciar sesión." };
  }

  // Slug estable + intento simple de evitar colisión
  const base = slugify(name);
  let finalSlug = base;

  let tries = 0;
  while (tries < 5) {
    const { data: existing, error: exErr } = await supabase
      .from("horses")
      .select("id")
      .eq("andar_slug", andar_slug)
      .eq("slug", finalSlug)
      .eq("is_deleted", false)
      .limit(1);

    if (exErr) break;
    if (!existing || existing.length === 0) break;

    tries += 1;
    finalSlug = `${base}-${tries + 1}`;
  }

  // Insertar
  const { data, error } = await supabase
    .from("horses")
    .insert({
      name,
      slug: finalSlug,
      andar_slug,
      description: description ?? null,
      pedigree_url: pedigree_url ?? null,
      created_by: user.id,
    })
    .select("slug, andar_slug")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  // Revalidar páginas relacionadas
  revalidatePath(`/hall/${andar_slug}`);
  revalidatePath(`/hall/${andar_slug}/${data.slug}`);

  return { ok: true, slug: data.slug, andar: data.andar_slug };
}
