'use server';

import supabaseServer from '@/src/lib/supabase/server';
import { redirect } from 'next/navigation';

function slugify(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export type CreateHorseState = {
  ok: boolean | null;
  message: string | null;
};

export async function createHorseAction(
  _prev: CreateHorseState,
  formData: FormData
): Promise<CreateHorseState> {
  try {
    const name = String(formData.get('name') || '').trim();
    const andar_slug = String(formData.get('andar_slug') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const pedigree_url = String(formData.get('pedigree_url') || '').trim();

    if (!name || !andar_slug) {
      return { ok: false, message: 'Nombre y andar son obligatorios.' };
    }

    const slug = slugify(name);
    const supabase = supabaseServer();

    // 1) Si ya existe, redirige (idempotente)
    const { data: exists, error: exErr } = await supabase
      .from('horses')
      .select('id, andar_slug, slug')
      .eq('slug', slug)
      .eq('is_deleted', false)
      .maybeSingle();

    if (exErr) {
      return { ok: false, message: exErr.message };
    }

    if (exists) {
      // Ya existe: vete directo a la ficha de ese caballo
      redirect(`/hall/${exists.andar_slug}/${exists.slug}?from=exists`);
    }

    // 2) Inserta
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
      // Si es clave duplicada (por carrera), redirige
      if (inErr.code === '23505') {
        redirect(`/hall/${andar_slug}/${slug}?from=exists`);
      }
      return { ok: false, message: inErr.message };
    }

    redirect(`/hall/${ins.andar_slug}/${ins.slug}`);
  } catch (error: any) {
    return { ok: false, message: error?.message || 'Error inesperado' };
  }
}
