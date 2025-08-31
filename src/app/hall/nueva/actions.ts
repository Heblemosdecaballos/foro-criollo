// src/app/hall/nueva/actions.ts
"use server";

import { cookies } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import slugify from "@sindresorhus/slugify"; // instala si no la tienes, o usa tu util

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

  const cookieStore = cookies();
  const supabase = createSupabaseServer(cookieStore);

  // Validar sesión (si tu RLS lo requiere para insert)
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false, message: "Debes iniciar sesión." };
  }

  // Crear slug estable e idempotente por nombre (ajusta si necesitas unicidad más compleja)
  const base = slugify(name, { decamelize: false, lowercase: true });
  let finalSlug = base;

  // Intento de evitar colisión simple
  let tries = 0;
  while (tries < 5) {
    const { data: existing } = await supabase
      .from("horses")
      .select("id")
      .eq("andar_slug", andar_slug)
      .eq("slug", finalSlug)
      .eq("is_deleted", false)
      .limit(1);

    if (!existing || existing.length === 0) break;
    tries += 1;
    finalSlug = `${base}-${tries + 1}`;
  }

  // Insert
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

  // Revalidar listado de ese andar y la página nueva (por si la cargas SSR)
  revalidatePath(`/hall/${andar_slug}`);
  revalidatePath(`/hall/${andar_slug}/${data.slug}`);

  return { ok: true, slug: data.slug, andar: data.andar_slug };
}
