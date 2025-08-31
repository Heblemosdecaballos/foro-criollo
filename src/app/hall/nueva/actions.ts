"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

// --- Util: slugify inline (sin dependencias externas)
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

// Busca un slug disponible dentro del mismo andar
async function pickAvailableSlug(
  supabase: any,
  andar_slug: string,
  base: string
): Promise<string> {
  const { data: rows } = await supabase
    .from("horses")
    .select("slug")
    .eq("andar_slug", andar_slug)
    .eq("is_deleted", false)
    .like("slug", `${base}%`);

  const taken = new Set((rows || []).map((r: { slug: string }) => r.slug));
  if (!taken.has(base)) return base;

  let i = 2;
  while (i < 1000) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
    i++;
  }
  // fallback extremo
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createHorseAction(payload: Payload) {
  const { name, andar_slug, description, pedigree_url } = payload;

  if (!name || !andar_slug) {
    return { ok: false, message: "Faltan campos obligatorios." };
  }

  const supabase = createSupabaseServer();

  // 1) Validar sesión (RLS)
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user;
  if (userErr || !user) return { ok: false, message: "Debes iniciar sesión." };

  // 2) Validar que el andar exista (evita romper la FK)
  const { data: andarRows, error: andarErr } = await supabase
    .from("andares")
    .select("slug")
    .eq("slug", andar_slug)
    .limit(1);

  if (andarErr) {
    return { ok: false, message: `Error verificando andar: ${andarErr.message}` };
  }
  if (!andarRows || andarRows.length === 0) {
    return { ok: false, message: "Andar inválido. Actualiza la página e inténtalo de nuevo." };
  }

  // 3) Generar slug disponible en ese andar
  const base = slugify(name);
  let finalSlug = await pickAvailableSlug(supabase, andar_slug, base);

  // 4) Insertar con 1 reintento si hay colisión de índice
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
      // Revalidar páginas relevantes
      revalidatePath(`/hall/${andar_slug}`);
      revalidatePath(`/hall/${andar_slug}/${data.slug}`);
      return { ok: true, slug: data.slug, andar: data.andar_slug };
    }

    const msg = String(error?.message || "");
    if (msg.includes("duplicate key") || (error as any)?.code === "23505") {
      // retry 1 vez con sufijo aleatorio
      finalSlug = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
      continue;
    }
    return { ok: false, message: msg || "No se pudo crear el ejemplar." };
  }

  return { ok: false, message: "No se pudo crear el ejemplar por colisión de slug." };
}
