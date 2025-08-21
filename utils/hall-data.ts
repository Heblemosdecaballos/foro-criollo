// /utils/hall-data.ts
import { createSupabaseServerClient } from '@/utils/supabase/server';

export type ViewerProfile = { id: string; name: string | null } | null;

/**
 * Devuelve un perfil del Hall por slug.
 * Espera que la tabla "hall_profiles" tenga: id, slug, title, gait, year.
 */
export async function getProfileBySlug(slug: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('hall_profiles')
    .select('id, slug, title, gait, year')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('getProfileBySlug error:', error);
    return null;
  }
  return data;
}

/**
 * Devuelve el perfil del usuario autenticado desde la tabla "profiles".
 * Si no tiene registro en "profiles", retorna { id, name: null } para que puedas mostrar "usuario".
 */
export async function getViewerProfile(): Promise<ViewerProfile> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('getViewerProfile error:', error);
    return { id: user.id, name: null };
  }

  return data ?? { id: user.id, name: null };
}
