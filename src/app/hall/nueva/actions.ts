"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/hall/utils";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createHorseAction(input: {
  name: string;
  andar_slug: string;
  description?: string;
  pedigree_url?: string;
}) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return { ok: false, message: "Solo admin." };
  }

  const slug = slugify(input.name);

  const { data, error } = await supabase
    .from("horses")
    .insert({
      name: input.name,
      slug,
      andar_slug: input.andar_slug,
      description: input.description || null,
      pedigree_url: input.pedigree_url || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  return { ok: true, andar: input.andar_slug, slug, id: data.id };
}
