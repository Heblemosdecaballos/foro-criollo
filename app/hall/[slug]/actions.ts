'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// ⚠️ Ajusta este import a tu helper real de Supabase en el servidor.
// En muchos proyectos está en "@/utils/supabase/server".
import { createServerClient } from '@/utils/supabase/server';

/**
 * Helpers
 */
async function getSupabase() {
  // Crea el cliente de supabase atado a cookies (sesión en server actions)
  return createServerClient(cookies());
}

async function requireUser() {
  const supabase = await getSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) { throw error; }
  if (!user) { throw new Error('not-authenticated'); }

  return { supabase, user };
}

function publicMediaUrl(supabaseUrl: string, path: string) {
  // Devuelve URL pública (tu bucket "hall" debe ser público o tener políticas read)
  return `${supabaseUrl}/storage/v1/object/public/hall/${path}`;
}

/**
 * Votos (toggle)
 * Llamado desde <VoteButton /> importando { toggleVote } de './actions'
 */
export async function toggleVote(profileId: string, slug: string) {
  const { supabase, user } = await requireUser();

  // ¿Ya existe el voto?
  const { data: existing, error: selErr } = await supabase
    .from('hall_votes')
    .select('id')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (selErr) { throw selErr; }

  if (existing) {
    const { error: delErr } = await supabase
      .from('hall_votes')
      .delete()
      .eq('id', existing.id);

    if (delErr) { throw delErr; }
  } else {
    const { error: insErr } = await supabase
      .from('hall_votes')
      .insert({ profile_id: profileId, user_id: user.id });

    if (insErr) { throw insErr; }
  }

  revalidatePath(`/hall/${slug}`);
  revalidatePath(`/admin/hall/${slug}`);
  return { ok: true };
}

/**
 * Subir IMAGEN a la galería (bucket "hall")
 * FormData esperado:
 *   - file: File (input name="file")
 *   - profileId: string
 *   - slug: string (para revalidatePath)
 *   - caption: string (opcional)
 *
 * Llamado desde <AddMediaForm /> importando { addMediaAction } de './actions'
 */
export async function addMediaAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const file = formData.get('file') as File | null;
  const profileId = String(formData.get('profileId') ?? '');
  const slug = String(formData.get('slug') ?? '');
  const caption = (formData.get('caption') ?? '') as string;

  if (!file || !profileId || !slug) {
    throw new Error('missing-fields');
  }

  // Construimos ruta dentro del bucket "hall"
  const safeName = (file as any).name?.replace(/\s+/g, '_') ?? `media-${Date.now()}.jpg`;
  const path = `media/${profileId}/${crypto.randomUUID()}-${safeName}`;

  // 1) Subir al bucket
  const { error: uploadErr } = await supabase.storage
    .from('hall')
    .upload(path, file, { upsert: false });

  if (uploadErr) { throw uploadErr; }

  // 2) Guardar registro en hall_media
  const publicUrl = publicMediaUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, path);

  const { error: insErr } = await supabase
    .from('hall_media')
    .insert({
      profile_id: profileId,
      type: 'image',       // usamos 'image' para distinguir
      url: publicUrl,
      caption: caption || null,
      created_by: user.id,
    });

  if (insErr) { throw insErr; }

  revalidatePath(`/hall/${slug}`);
  revalidatePath(`/admin/hall/${slug}`);
  return { ok: true };
}

/**
 * Agregar VIDEO DE YOUTUBE a la galería (sólo guardamos la URL)
 * FormData esperado:
 *   - url: string (https://www.youtube.com/...)
 *   - profileId: string
 *   - slug: string
 *   - caption: string (opcional)
 *
 * Llamado desde <AddVideoForm /> importando { addYoutubeAction } de './actions'
 */
export async function addYoutubeAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const url = String(formData.get('url') ?? '');
  const profileId = String(formData.get('profileId') ?? '');
  const slug = String(formData.get('slug') ?? '');
  const caption = (formData.get('caption') ?? '') as string;

  if (!url || !profileId || !slug) {
    throw new Error('missing-fields');
  }

  const { error: insErr } = await supabase
    .from('hall_media')
    .insert({
      profile_id: profileId,
      type: 'video',  // distinguimos entre 'image' y 'video'
      url,
      caption: caption || null,
      created_by: user.id,
    });

  if (insErr) { throw insErr; }

  revalidatePath(`/hall/${slug}`);
  revalidatePath(`/admin/hall/${slug}`);
  return { ok: true };
}

/**
 * Agregar COMENTARIO al perfil del Hall
 * FormData esperado:
 *   - content: string
 *   - profileId: string
 *   - slug: string
 *
 * Llamado desde <HallCommentForm /> importando { addHallComment } de './actions'
 */
export async function addHallComment(formData: FormData) {
  const { supabase, user } = await requireUser();

  const content = String(formData.get('content') ?? '');
  const profileId = String(formData.get('profileId') ?? '');
  const slug = String(formData.get('slug') ?? '');

  if (!content || !profileId || !slug) {
    throw new Error('missing-fields');
  }

  const { error: insErr } = await supabase
    .from('hall_comments')
    .insert({
      profile_id: profileId,
      content,
      user_id: user.id,
    });

  if (insErr) { throw insErr; }

  revalidatePath(`/hall/${slug}`);
  revalidatePath(`/admin/hall/${slug}`);
  return { ok: true };
}
