"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/hall/utils";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");
}

export async function createHorseAction(formData: FormData) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return { ok: false, message: "Solo el admin puede crear ejemplares." };
  }

  const name = String(formData.get("name") || "").trim();
  const andar = String(formData.get("andar") || "").trim();
  const description = (formData.get("description") || "").toString();
  const pedigree_url = (formData.get("pedigree_url") || "").toString() || null;

  if (!name || !andar) return { ok: false, message: "Nombre y andar son obligatorios." };

  const slug = slugify(name);

  const { data, error } = await supabase
    .from("horses")
    .insert({
      name, slug, andar_slug: andar,
      description, pedigree_url,
      created_by: user.id
    })
    .select("slug, andar_slug")
    .single();

  if (error) return { ok: false, message: error.message };

  return { ok: true, slug: data.slug, andar: data.andar_slug };
}
