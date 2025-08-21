// /app/hall/[slug]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Alterna el voto del usuario para un perfil del Hall.
 * Devuelve { ok: boolean, votes?: number, error?: string }
 */
export async function toggleVote(profileId: string, slug: string) {
  const supabase = supabaseServer();

  // Verificar usuario logeado
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return { ok: false, error: 'UNAUTHENTICATED' };
  }

  // ¿Ya existe voto?
  const { data: existing, error: readErr } = await supabase
    .from('hall_votes')
    .select('id')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (readErr) {
    return { ok: false, error: readErr.message };
  }

  if (existing) {
    // Si existe, se elimina (quitar voto)
    const { error: delErr } = await supabase
      .from('hall_votes')
      .delete()
      .eq('id', existing.id);

    if (delErr) return { ok: false, error: delErr.message };
  } else {
    // Si no existe, se inserta (dar voto)
    const { error: insErr } = await supabase
      .from('hall_votes')
      .insert({ profile_id: profileId, user_id: user.id });

    if (insErr) return { ok: false, error: insErr.message };
  }

  // Recontar votos
  const { count } = await supabase
    .from('hall_votes')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId);

  // Refrescar la página del perfil
  revalidatePath(`/hall/${slug}`);

  return { ok: true, votes: count ?? 0 };
}
