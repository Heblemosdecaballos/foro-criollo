// /app/hall/[slug]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

/**
 * Alterna el voto del usuario para un perfil del Hall.
 * Devuelve { ok: boolean, votes?: number, error?: string }
 */
export async function toggleVote(profileId: string, slug: string) {
  const supabase = supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return { ok: false, error: 'UNAUTHENTICATED' };

  const { data: existing, error: readErr } = await supabase
    .from('hall_votes')
    .select('id')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (readErr) return { ok: false, error: readErr.message };

  if (existing) {
    const { error: delErr } = await supabase
      .from('hall_votes')
      .delete()
      .eq('id', existing.id);
    if (delErr) return { ok: false, error: delErr.message };
  } else {
    const { error: insErr } = await supabase
      .from('hall_votes')
      .insert({ profile_id: profileId, user_id: user.id });
    if (insErr) return { ok: false, error: insErr.message };
  }

  const { count } = await supabase
    .from('hall_votes')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId);

  revalidatePath(`/hall/${slug}`);
  return { ok: true, votes: count ?? 0 };
}

/**
 * Subir media (imagen/video) al bucket "hall" y registrar en hall_media.
 * Se llama desde el AddMediaForm (cliente).
 *
 * FormData esperado:
 *  - file: File (image/* o video/*)
 *  - caption: string (opcional)
 *  - profileId: string
 *  - slug: string
 */
export async function addMediaAction(formData: FormData) {
  const supabase = supabaseServer();

  // Usuario logeado
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return { ok: false, error: 'UNAUTHENTICATED' };
  }

  const file = formData.get('file') as File | null;
  const caption = (formData.get('caption') as string | null) ?? '';
  const profileId = formData.get('profileId') as string | null;
  const slug = formData.get('slug') as string | null;

  if (!file || !profileId || !slug) {
    return { ok: false, error: 'FALTAN_DATOS' };
  }

  // Construir ruta de subida en el bucket
  const cleanName = file.name.replace(/\s+/g, '-');
  const objectPath = `${profileId}/media/${randomUUID()}-${cleanName}`;

  // Subir a Storage (bucket "hall")
  const { error: upErr } = await supabase
    .storage
    .from('hall')
    .upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (upErr) {
    return { ok: false, error: upErr.message };
  }

  // URL pública (si el bucket es público)
  const { data: pub } = supabase.storage.from('hall').getPublicUrl(objectPath);
  const publicUrl = pub?.publicUrl ?? null;

  // Determinar tipo simple
  const mediaType = file.type.startsWith('video/')
    ? 'video'
    : file.type.startsWith('image/')
    ? 'image'
    : 'file';

  // Insertar metadatos en hall_media
  const { error: metaErr } = await supabase
    .from('hall_media')
    .insert({
      profile_id: profileId,
      user_id: user.id,
      storage_path: objectPath,
      public_url: publicUrl,
      caption: caption || null,
      media_type: mediaType,
    });

  if (metaErr) {
    // (Opcional) borrar del storage si la inserción falla
    await supabase.storage.from('hall').remove([objectPath]);
    return { ok: false, error: metaErr.message };
  }

  // Refrescar página del perfil
  revalidatePath(`/hall/${slug}`);

  return { ok: true };
}
