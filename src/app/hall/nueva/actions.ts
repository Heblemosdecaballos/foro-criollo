'use server';

import supabaseServer from '@/src/lib/supabase/server';

function slugify(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export type CreateHorsePayload = {
  name: string;
  andar_slug: string;
  description?: string;
  pedigree_url?: string;
};

export type CreateHorseResult = {
  ok: boolean;
  message?: string | null;
  andar?: string;
  slug?: string;
};

export async function createHorseAction(payload: CreateHorsePayload): Promise<CreateHorseResult> {
  try {
    const name = (payload.name || '').trim();
    const andar_slug = (payload.andar_slug || '').trim();
    const description = (payload.description || '').trim();
    const pedigree_url = (payload.pedigree_url || '').trim();

    if (!name || !andar_slug) {
      return { ok: false, message: 'Nombre y andar son obligatorios.' };
    }

    const slug = slugify(name);
    const supabase = supabaseServer();

    // 1) Si ya existe (no borrado), devolvemos su ruta (idempotente)
    const { data: exists, error: exErr } = await supabase
      .from('horses')
      .select('andar_slug, slug')
      .eq('slug', slug)
      .eq('is_deleted', false)
      .maybeSingle();

    if (exErr) return { ok: false, message: exErr.message };

    if (exists) {
      return { ok: true, andar: exists.andar_slug, slug: exists.slug };
    }

    // 2) Insertar
    const { data: ins, error: inErr } = await supabase
      .from('horses')
      .insert({
        name,
        slug,
        andar_slug,
        description: description || null,
        pedigree_url: pedigree_url || null,
      })
      .select('andar_slug, slug')
      .single();

    if (inErr) {
      // Carrera: otro insertó el mismo slug; devolvemos la ruta
      if ((inErr as any).code === '23505') {
        return { ok: true, andar: andar_slug, slug };
      }
      return { ok: false, message: inErr.message };
    }

    return { ok: true, andar: ins!.andar_slug, slug: ins!.slug };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Error inesperado' };
  }
}
