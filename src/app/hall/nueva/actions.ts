"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

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

async function pickAvailableSlug(
  supabase: ReturnType<typeof createSupabaseServer>,
  andar_slug: string,
  base: string
): Promise<string> {
  // Trae todos los que empiecen por base en ese andar (ignora borrados)
  const { data: rows, error } = await supabase
    .from("horses")
    .select("slug")
    .eq("andar_slug", andar_slug)
    .eq("is_deleted", false)
    .like("slug", `${base}%`);

  if (error) {
    // Si hay error al listar, usa el base y dejamos que el índice nos avise si choca
    return base;
  }

  const taken = new Set((rows || []).map((r) => r.slug));
  if (!taken.has(base)) return base;

  // Busca siguiente disponible: base-2, base-3, ... (límite prudente)
  let i = 2;
  while (i < 1000) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
    i++;
  }

  // Fallback (muy raro llegar aquí)
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createHorseAction(payload: Payload) {
  const { name, andar_slug, description, pedigree_url } = payload;

  if (!name || !andar_slug) {
    return { ok: false, message: "Faltan campos obligatorios." };
  }

  const supabase = createSupabaseServer();

  // Validar sesión (según RLS)
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false, message: "Debes iniciar sesión." };
  }

  // Generar slug base y elegir uno disponible en ese andar
  const base = slugify(name);
  let finalSlug = await pickAvailableSlug(supabase, andar_slug, base);

  // Intento de inserción con 1 reintento si hay carrera (23505)
  for (let attempt = 0; attempt < 2; attempt++) {
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

    if (!error && data) {
      // Revalidar páginas relacionadas
      revalidatePath(`/hall/${andar_slug}`);
      revalidatePath(`/hall/${andar_slug}/${data.slug}`);
      return { ok: true, slug: data.slug, andar: data.andar_slug };
    }

    // Si fue violación de unicidad, generamos otro slug y reintentamos 1 vez
    const pgCode = (error as any)?.code || (error as any)?.details || "";
    if (pgCode === "23505" || String(error?.message || "").includes("duplicate key")) {
      finalSlug = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
      continue;
    }

    // Otro error: devolvemos mensaje
    return { ok: false, message: error?.message || "No se pudo crear el ejemplar." };
  }

  return { ok: false, message: "No se pudo crear el ejemplar por colisión de slug." };
}
